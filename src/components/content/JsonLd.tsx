import {
  jsonLdGraph,
  serializeJsonLd,
  type JsonLdGraph,
  type JsonLdNodeInput,
} from "@/lib/structured-data";

export type JsonLdProps = {
  graph?: JsonLdGraph;
  nodes?: readonly JsonLdNodeInput[];
  id?: string;
};

/** Renders exactly one server-rendered JSON-LD script for the current page. */
export function JsonLd({ graph, nodes, id = "page-structured-data" }: JsonLdProps) {
  const value = graph ?? jsonLdGraph(nodes ?? []);
  if (!value["@graph"].length) return null;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}
    />
  );
}

export default JsonLd;
