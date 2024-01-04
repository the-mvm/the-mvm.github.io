---
layout: post
read_time: true
show_date: true
title: "Using “React Query” to query smart contracts (part 2)"
date: 2022-12-06
img: posts/20221206/TrainTracks.jpeg
tags: [web3, react, react-query]
category: development
author: Antão Almada
---

In my [previous post](Using-React-Query-to-query-smart-contracts-1.md) I explained how `useQuery` can be used to retrieve the value from an immutable method. Now let’s go up a notch and see how to use on methods where the returned value may change over time.

> NOTE: This series of articles use [TypeChain](https://github.com/dethcrypto/TypeChain) to make strongly-typed calls to Ethereum. Please check its [documentation and discussion board](https://github.com/dethcrypto/TypeChain) to learn how to set it up. It’s also assumed some knowledge of React Query.

## Custom hook

Let’s say that our `MyToken` smart contract derives from [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/206a2394481ec1af16d0e0acf216bbffedde405b/contracts/security/Pausable.sol#L17)’s `Pausable`. This means `MyToken` has a `paused()` public method that returns a `bool`. Based on the previous post, we can implement the following to retrieve `paused()` value:

```javascript
import { useQuery } from "@tanstack/react-query";
import { Pausable } from "../../typechain-types";

const fetchPaused = (contract: Pausable) => contract.paused();

const usePaused = (contract: Pausable | undefined) => {
	const { data, ...result } = useQuery(
		[`pausable-paused`, contract?.address],
		() => fetchPaused(contract!),
		{
			enabled: !!contract,
			initialData: true,
		}
	);

	return { paused: data, ...result };
};

export default usePaused;
```

Notice that the parameter contract is of type `Pausable`. This allows this hook to be used for any contract that derives from `Pausable`. Calling the hook can look something like this:

```javascript
const { paused, isLoading: isLoadingPaused } = usePaused(contract);
```

Notice in the `useQuery` options that the `initialData` is set to `true`. This value is added to the cache before the first call. It’s safer to assume that the contract is paused than assuming by default that it’s unpaused.

## Making it reactive

`Pausable` has [internal methods `_pause()` and `_unpause()`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/206a2394481ec1af16d0e0acf216bbffedde405b/contracts/security/Pausable.sol#L89) that change the value returned by `paused()`. These methods would be exposed as public methods on `MyToken` with restricted access to an admin account. Using the `usePaused` hook implementation from above, we would have to refresh the page to find the changes caused by these two methods. Fortunately there’s a way to fix this issue.

`Pausable` emits the [events `Paused` and `Unpaused`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/206a2394481ec1af16d0e0acf216bbffedde405b/contracts/security/Pausable.sol#L21) when their respective methods succeed. [TypeChain](https://github.com/dethcrypto/TypeChain) generates the required code to register and unregister callbacks for these events. It can be used as follow:

```javascript
const onPaused: TypedListener<PausedEvent> = (_sender: string) =>
	console.log("paused")

const onUnpaused: TypedListener<UnpausedEvent> = (_sender: string) =>
	console.log("unpaused")

contract
	.on(contract.filters.Paused(), onPaused)
	.on(contract.filters.Unpaused(), onUnpaused);
```

We can use these callbacks to invalidate the cache in `usePaused`. To do that we’ll have to add the following:

```javascript
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
```

We are using a `useEffect` that registers the callbacks and returns a lambda that unregisters them.

Both callbacks call a `onPausedChange` method. This method performs an optimistic update, meaning that it sets the value in the cache even before the retrieve call is performed.

> Unfortunately the event handler is called multiple times when the event is emitted. That’s not a big issue in this case but take it into considerations when adding and removing elements from a collection.

The code inside `onPausedChange` needs two additional values: `queryClient` and `queryKey`. For the `queryClient`, we can use the value returned by `useQueryClient`. For the `queryKey`, we have to use the same value as it’s passed to `useQuery`. As the `queryKey` value varies with the contract address, we should use a `useMemo`.

Putting it all together will look like this:

```javascript
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pausable } from "../../typechain-types";
import { TypedListener } from "../../typechain-types/common";
import {
	PausedEvent,
	UnpausedEvent,
} from "../../typechain-types/@openzeppelin/contracts/security/Pausable";

const fetchPaused = (contract: Pausable) => contract!.paused();

const usePaused = (contract: Pausable | undefined) => {
	const queryClient = useQueryClient();

	const queryKey = useMemo(
		() => [`pausable-paused`, contract?.address],
		[contract]
	);

	const { data, ...result } = useQuery(
		queryKey,
		() => fetchPaused(contract!),
		{
			enabled: !!contract,
			initialData: true,
		}
	);

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

Using this custom hook, the value of paused automatically changes when it changes on the smart contract. This allows for your app to be fully reactive.

This last version of `usePaused` adds `queryKey` to the returned object so that callers may use it to invalidate cache anywhere else if required.

Previous: [Using “React Query” to query smart contracts (part 1)](https://aalmada.github.io/Using-React-Query-to-query-smart-contracts-1.html)

Next: [Using “React Query” to query smart contracts (part 3)](https://aalmada.github.io/Using-React-Query-to-query-smart-contracts-3.html)

