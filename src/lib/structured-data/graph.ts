import type {
  JsonLdGraph,
  JsonLdNode,
  JsonLdNodeInput,
} from "./types";

function flattenNodes(input: JsonLdNodeInput, output: JsonLdNode[]) {
  if (!input) return;
  if (Array.isArray(input)) {
    for (const child of input) flattenNodes(child, output);
    return;
  }
  output.push(input as JsonLdNode);
}

function typeKey(type: JsonLdNode["@type"]) {
  return (Array.isArray(type) ? [...type].sort() : [type]).join("|");
}

/**
 * Produces the single Schema.org graph rendered for a page. Duplicate nodes
 * with the same @id and type are merged. Conflicting types sharing an @id and
 * multiple FAQPage nodes are rejected instead of emitting ambiguous markup.
 */
export function jsonLdGraph(nodes: readonly JsonLdNodeInput[]): JsonLdGraph {
  const flattened: JsonLdNode[] = [];
  flattenNodes(nodes, flattened);

  const unique = new Map<string, JsonLdNode>();
  let anonymousIndex = 0;

  for (const node of flattened) {
    const id = typeof node["@id"] === "string" ? node["@id"] : undefined;
    const key = id || `anonymous:${typeKey(node["@type"])}:${anonymousIndex++}`;
    const existing = unique.get(key);

    if (!existing) {
      unique.set(key, node);
      continue;
    }

    if (typeKey(existing["@type"]) !== typeKey(node["@type"])) {
      throw new Error(
        `Conflicting JSON-LD types share @id ${id}: ${typeKey(existing["@type"])} and ${typeKey(node["@type"])}`,
      );
    }

    unique.set(key, { ...existing, ...node });
  }

  const graph = [...unique.values()];
  const faqCount = graph.filter((node) => typeKey(node["@type"]) === "FAQPage").length;
  if (faqCount > 1) {
    throw new Error("A page can contain only one FAQPage JSON-LD node.");
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Escapes characters that could terminate or corrupt an inline script. */
export function serializeJsonLd(value: JsonLdGraph) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
