export type JsonLdPrimitive = string | number | boolean | null;

export type JsonLdValue = JsonLdPrimitive | JsonLdObject | readonly JsonLdValue[];

export type JsonLdObject = {
  [key: string]: JsonLdValue | undefined;
};

export type JsonLdNode = JsonLdObject & {
  "@type": string | readonly string[];
  "@id"?: string;
};

export type JsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
};

export type JsonLdNodeInput =
  | JsonLdNode
  | readonly JsonLdNodeInput[]
  | null
  | undefined
  | false;
