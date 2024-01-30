---
layout: post
read_time: true
show_date: true
title: "Using “React Query” to query smart contracts (part 3)"
date: 2022-12-06
img_path: /assets/img/posts/20221206
image: Lichen.jpeg
tags: [development, web3, react, react-query]
category: development
---

Wallets that support multiple accounts and multiple blockchains, like MetaMask, make it very easy for a user to change active account and active blockchain. A web3 frontend should react immediately to these changes.

> NOTE: This series of articles use [TypeChain](https://github.com/dethcrypto/TypeChain) to make strongly-typed calls to Ethereum. Please check its [documentation and discussion board](https://github.com/dethcrypto/TypeChain) to learn how to set it up. It’s also assumed some knowledge of React Query.

## ChainId

On the previous posts the contract address was added to the `queryKey` so that `useQuery` uses a different cache for each instance of the contract.

A contract can be deployed on multiple blockchains, like Ethereum, Goerli, Polygon, etc. It can have the same address in each of the blockchains but these would still be different instances. This means that the blockchain identifier must also be part of the `queryKey`.

Each blockchain has a unique identifier. This is commonly called the `chainId`. You can find all the valid values listed at https://chainlist.org/.

In TypeChain all the contracts derive from ether’s `BaseContract`. This exposes the address property that we’ve been using. The `chainId` can be retrieved using the `getChainId()` method found in the signer property. This is an async method that returns a `Promise<number>`.

React does not support asynchronous methods directly so we need the following source code using an `useEffect` and an `useState`.

```javascript
const [chainId, setChainId] = useState<number>();

const queryKey = useMemo(
    () => [`ownable-owner`, chainId, contract?.address],
    [chainId, contract]
);

useEffect(() => {
    const updateChainId = async (contract: Ownable | undefined) => {
        setChainId(await contract?.signer.getChainId());
    };

    updateChainId(contract);
}, [contract]);
```

The `useEffect` is called every time contract changes. It calls an asynchronous method that calls `setChainId`. `chainId` was added to the `useMemo` so that it updates the `queryKey` when the asynchronous method finishes setting the `chainId`.

Putting it all together looks like this:

```javascript
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pausable } from "../../typechain-types";
import { TypedListener } from "../../typechain-types/common";
import {
	PausedEvent,
	UnpausedEvent,
} from "../../typechain-types/contracts/MyToken";

const fetchPaused = (contract: Pausable) => contract.paused();

const usePaused = (contract: Pausable | undefined) => {
	const [chainId, setChainId] = useState<number>();

	const queryClient = useQueryClient();

	const queryKey = useMemo(
		() => [`pausable-paused`, chainId, contract?.address],
		[chainId, contract]
	);

	const { data, ...result } = useQuery(
		queryKey,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		() => fetchPaused(contract!),
		{
			enabled: !!contract,
			initialData: true,
		}
	);

	useEffect(() => {
		const updateChainId = async (contract: Pausable | undefined) => {
			setChainId(await contract?.signer.getChainId());
		};

		updateChainId(contract);
	}, [contract]);

	useEffect(() => {
		const onPaused: TypedListener<PausedEvent> = (_sender: string) =>
			onPausedChange(true);

		const onUnpaused: TypedListener<UnpausedEvent> = (_sender: string) =>
			onPausedChange(false);

		const onPausedChange = (paused: boolean) => {
			queryClient.cancelQueries(queryKey);
			queryClient.setQueryData<boolean>(queryKey, _previous => paused);
			queryClient.invalidateQueries(queryKey);
		};

		if (contract) {
			contract
				.on(contract.filters.Paused(), onPaused)
				.on(contract.filters.Unpaused(), onUnpaused);

			return () => {
				contract
					.removeListener(contract.filters.Paused(), onPaused)
					.removeListener(contract.filters.Unpaused(), onUnpaused);
			};
		}
	}, [contract, queryClient, queryKey]);

	return { paused: data, queryKey, ...result };
};

export default usePaused;
```

This custom hook seems a bit complex but it adds the following to all the advantages already listed in part 1 of the series:

- Caches different values depending on the contract `address` and `chainId`.
- Updates are triggered by events emitted by the contract.
- Use of optimistic updates.
- Allow external reset of cache by exposing the `queryKey`.

Using hooks like this one results in reactive applications where the user doesn’t have to refresh the page or, wait for replies to unnecessary and potentially slow calls.

It’s possible to expand this pattern to other smart contract methods. Just be careful to add all the query properties to the `queryKey` and, subscribe to all the relevant smart contract events to invalidate the query.
