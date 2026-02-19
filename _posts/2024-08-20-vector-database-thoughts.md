---
layout: post
title: "벡터 데이터베이스, 진짜 필요한 건가 - AI 시대의 새로운 고민"
date: 2024-08-20 09:00:00 +0900
categories: [Development, Database]
tags: [벡터DB, Pinecone, AI, 임베딩, 데이터베이스]
author: "Kevin Park"
lang: ko
excerpt: "AI 서비스를 만들다 보면 벡터 데이터베이스가 필요하다는 얘기를 많이 듣는다. 근데 진짜 필요한 건지, 기존 DB로도 되는 건지 고민해봤다."
---

# 벡터 데이터베이스, 진짜 필요한 건가

## AI 시대의 새로운 과제

[MSA 설계에 ChatGPT를 활용하는 이야기](/2024/02/10/msa-and-chatgpt/)를 쓴 적 있는데, AI를 업무에 쓰면 쓸수록 자연스럽게 벡터 데이터베이스에 대한 관심이 생겼다.

RAG(Retrieval-Augmented Generation)를 구현하려면 문서를 임베딩 벡터로 변환해서 저장하고, 유사한 벡터를 검색할 수 있어야 한다. 이걸 위한 전용 DB가 벡터 데이터베이스다.

Pinecone, Weaviate, Milvus, Chroma... 선택지가 꽤 많다. 근데 이게 진짜 필요한 건지 고민이 됐다.

## 기존 DB로도 되지 않나?

사실 PostgreSQL에도 pgvector 확장이 있다. 벡터 검색을 기존 RDB에서 할 수 있다는 거다.

```sql
-- pgvector 사용 예시
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- 코사인 유사도로 유사한 문서 검색
SELECT content
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

이미 PostgreSQL을 쓰고 있다면 별도의 벡터 DB를 도입하는 것보다 pgvector를 붙이는 게 훨씬 간단하다. 인프라 하나 더 관리할 필요가 없으니까.

## 그래도 전용 DB가 필요한 경우

근데 데이터가 수백만, 수천만 건이 되면 이야기가 달라진다.

전용 벡터 DB는 ANN(Approximate Nearest Neighbor) 검색에 최적화되어 있다. HNSW, IVF 같은 인덱싱 알고리즘이 기본 탑재되어 있어서 대량의 벡터에서도 빠르게 유사 검색이 된다.

pgvector도 인덱싱을 지원하긴 하지만, 수천만 건 이상의 벡터에서는 전용 DB와 성능 차이가 크다고 한다.

그리고 메타데이터 필터링과 벡터 검색을 동시에 하는 하이브리드 검색도 전용 DB가 더 유리하다.

## 현실적인 판단 기준

내가 내린 결론은 이렇다.

**벡터 데이터가 10만 건 이하** → pgvector로 충분. 별도 인프라 운영 비용이 더 아깝다.

**10만~100만 건** → pgvector로 시작하되, 성능이 부족해지면 전용 DB 검토.

**100만 건 이상** → 전용 벡터 DB 고려. Pinecone 같은 관리형 서비스가 편하고, 직접 운영하려면 Milvus나 Weaviate.

대부분의 프로젝트는 사실 첫 번째 케이스에 해당한다. AI 서비스 만든다고 바로 Pinecone 결제하기 전에, 기존 DB로 충분한지 먼저 확인하는 게 맞다.

## 또 하나의 "적정 기술" 문제

이건 결국 적정 기술 선택의 문제다.

[클라우드 vs 온프레미스](/2020/04/20/cloud-vs-onpremise-server/) 때도 그랬고, [MySQL UUID 활용](/2020/04/21/mysql-uuid-usage/) 때도 그랬고. 새로운 기술이 나오면 "이거 써야 하나?"라는 고민이 생기는데, 정답은 항상 "상황에 따라 다르다"다.

벡터 DB가 핫하다고 무조건 도입하면 오버엔지니어링이고, 필요한데 안 쓰면 비효율이다. 현재 데이터 규모와 요구사항을 냉정하게 보고 판단하는 게 개발자의 역할이다.

근데 이 "냉정한 판단"이라는 게 말은 쉬운데, 새 기술 보면 쓰고 싶어지는 게 개발자의 본능이라...
