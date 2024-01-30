---
layout: post
read_time: true
show_date: true
title: "Using “React Query” to query smart contracts (part 1)"
date: 2022-12-05
img_path: /assets/img/posts/20221205
image: Cluster.jpeg
tags: [development, web3, react, react-query]
category: development
---

> React Query is often described as the missing data-fetching library for React, but in more technical terms, it makes fetching, caching, synchronizing and updating server state in your React applications a breeze.

[React Query](https://tanstack.com/query/) is great to retrieve data from any remote source. Most examples of its use are based on querying web APIs. This series of articles will explain how to use it to query smart contracts.

> NOTE: This series of articles use [TypeChain](https://github.com/dethcrypto/TypeChain) to make strongly-typed calls to Ethereum. Please check its [documentation and discussion board](https://github.com/dethcrypto/TypeChain) to learn how to set it up. It’s also assumed some knowledge of React Query.

Let’s start by using a smart contract named `MyToken` that has a public method named `MAX_SUPPLY()` that returns the maximum number of tokens that can be minted. This value is set on deploy and cannot be changed afterwards.

To retrieve its value using TypeChain we would only need this simple code:

```javascript
import { MyToken } from "../../typechain-types";

const fetchMaxSupply = (contract: MyToken) => contract.MAX_SUPPLY();
```

This defines a method `fetchMaxSupply()` that takes a parameter contract of type `MyToken`. This simple code does what’s supposed to do but we know that `MAX_SUPPLY` is immutable and we don’t want to retrieve the value unnecessarily. That’s where the React Query's `useQuery()` becomes very useful.

We can create a custom hook to encapsulate all the complexity:

```javascript
import { useQuery } from "@tanstack/react-query";
import { MyToken } from "../../typechain-types";

const fetchMaxSupply = (contract: MyToken) => contract.MAX_SUPPLY();

const useMaxSupply = (contract: MyToken | undefined) => {
	const { data, ...result } = useQuery(
		[`my-token-max-supply`, contract?.address],
		() => fetchMaxSupply(contract!),
		{
			enabled: !!contract,
			cacheTime: Infinity,
		}
	);

	return { maxSupply: data, ...result };
};

export default useMaxSupply;
```

Things to note in this code:

- The query key contains the contract address so that it can cache different values for different addresses.
- The query is not enabled when the contract is `undefined`.
- The cache time is set to `Infinity` as the value is immutable for each address.
- `data` is renamed to `maxSupply`.

The `useMaxSupply()` hook can be called as follow:

```javascript
const { maxSupply, isLoading: isLoadingMaxSupply } = useMaxSupply(contract);
```

The variables `maxSupply` and `isLoadingMaxSupply` can now be referenced in your React components.

This custom hook is way more complex than the method that we started from but it’s so much more powerful. It’s very simple to use it and adds all the following:

- Integrates easily on any React component.
- Handles undefined values.
- Handles errors.
- Caches different values depending on the contract address.
- The `isLoading` property makes it easy to integrate spinner animations.
- Allow external reset of cache by exposing the queryKey.

This is the simplest example of using `useQuery` to query a smart contract. In the next articles I’ll go through more complex examples. I’ll then also start a series on `useMutation`.
