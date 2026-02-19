---
layout: post
title: "Vector Databases - Do You Actually Need One?"
date: 2024-08-20 09:00:00 +0900
categories: [Development, Database]
tags: [Vector DB, Pinecone, AI, Embeddings, Database]
author: "Kevin Park"
lang: en
excerpt: "Building AI services, you hear 'you need a vector database' constantly. But do you really? Or can your existing database handle it just fine?"
---

# Vector Databases — Do You Actually Need One?

## A New Challenge in the AI Era

After [writing about using ChatGPT for MSA design](/2024/02/10/msa-and-chatgpt-en/), the deeper I got into AI tooling, the more I naturally started thinking about vector databases.

Implementing RAG (Retrieval-Augmented Generation) requires converting documents into embedding vectors, storing them, and searching for similar vectors. That's what vector databases are built for.

Pinecone, Weaviate, Milvus, Chroma — plenty of options. But the real question is whether you actually need one.

## Can't Regular Databases Handle This?

PostgreSQL has the pgvector extension. Vector search in your existing RDB.

```sql
-- pgvector example
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- Find similar documents by cosine similarity
SELECT content
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

If you're already running PostgreSQL, adding pgvector is far simpler than introducing a dedicated vector DB. One less piece of infrastructure to manage.

## When You Actually Need a Dedicated Vector DB

The story changes when your data hits millions or tens of millions of records.

Dedicated vector databases are optimized for ANN (Approximate Nearest Neighbor) search. Indexing algorithms like HNSW and IVF come built in, enabling fast similarity search even across massive vector collections.

pgvector supports indexing too, but at tens of millions of vectors, the performance gap with dedicated solutions reportedly becomes significant.

Hybrid search — combining metadata filtering with vector similarity — also favors dedicated databases.

## Practical Decision Framework

Here's my conclusion:

**Under 100K vectors** — pgvector is more than enough. The operational cost of separate infrastructure isn't worth it.

**100K to 1M vectors** — Start with pgvector. If performance becomes insufficient, evaluate dedicated options.

**Over 1M vectors** — Consider a dedicated vector DB. Managed services like Pinecone for convenience, or self-hosted Milvus/Weaviate for control.

Most projects honestly fall into the first category. Before signing up for Pinecone just because you're "building an AI service," verify whether your existing database can handle it first.

## Another "Right Tool" Decision

This is ultimately an appropriate technology selection problem.

Same as with [cloud vs on-premise](/2020/04/20/cloud-vs-onpremise-server-en/) and [MySQL UUID usage](/2020/04/21/mysql-uuid-usage-en/). When new technology emerges, you ask "should I use this?" The answer is always "it depends."

Adopting a vector DB because it's trending is over-engineering. Not using one when you need it is inefficiency. A developer's job is to assess the actual data scale and requirements objectively.

The "objective assessment" part sounds easy in theory, but seeing shiny new tech and wanting to use it — that's just developer instinct.
