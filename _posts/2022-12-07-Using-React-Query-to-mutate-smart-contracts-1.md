---
layout: post
read_time: true
show_date: true
title: "Using “React Query” to mutate smart contracts (part 1)"
date: 2022-12-07
img_path: /assets/img/posts/20221207
image: Rollercoaster.jpeg
tags: [development, web3, react, react-query]
category: development
---

In [previous posts](https://aalmada.github.io/Using-React-Query-to-query-smart-contracts-3.html) I explained how React Query can be used to query smart contracts, that is, to perform read calls. Now I’m going to explain how to mutate, that is, to execute transactions on the blockchain.

Unlike read calls, execution of transactions requires the confirmation by the user on the connected wallet as gas fees will be charged. The transaction has to be validated which may take several seconds or even minutes. The user should get reactive feedback so that his constantly aware of the required steps and the transaction state.

> NOTE: This series of articles use [TypeChain](https://github.com/dethcrypto/TypeChain) to make strongly-typed calls to Ethereum. Please check its [documentation and discussion board](https://github.com/dethcrypto/TypeChain) to learn how to set it up. It’s also assumed some knowledge of React Query.

Let’s go back to our `MyToken` smart contract that derives from [OpenZeppelin’s `Pausable`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/206a2394481ec1af16d0e0acf216bbffedde405b/contracts/security/Pausable.sol#L17). `MyToken` has a `pause()` public method with restricted access to the contract owner. This method simply calls the internal method `_pause()` provided by `Pausable`.

To implement `pause()` using TypeChain we would only need the following:

```javascript
const pause = async (contract: MyToken) => {
  const tx = await contract.pause();
  return tx.wait();
};
```

React Query provides a `useMutation()` hook for when we want to alter the state of a remote source. It makes it easy to integrate in React and adds features like error handling, retry on error, `isLoading` state, and many more.

We can wrap all this into a custom `usePause()` hook:

```javascript
import { ContractReceipt } from "ethers";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { MyToken } from "../../typechain-types";

const pause = async (contract: MyToken) => {
  const tx = await contract.pause();
  return tx.wait();
};

const usePause = (
  options?: Omit<
    UseMutationOptions<ContractReceipt, unknown, MyToken, unknown>,
    "mutationFn"
  >
) => {
  const { mutate, ...result } = useMutation(
    (contract: MyToken) => pause(contract),
    options
  );
  return { pause: mutate, ...result };
};

export default usePause;
```

It simple returns the result of `useMutation()` given the previous `pause()` method and renaming `mutate` to `pause`.

This custom hook can be used as follows:

```javascript
const { pause, isLoading: isPausing } = usePause();
```

The custom hook also supports the typical options provided by `useMutation()`. This means that it can also be used as follow:

```javascript
const { pause, isLoading: isPausing } = usePause({
  onMutate: () => {
    console.log("Pausing Mint!");
    console.log(
      "Please confirm transaction on your wallet and then wait for validation!"
    );
  },
  onError: (error) => {
    console.log("Error Pausing Mint!");
    console.log(error);
  },
  onSuccess: (data) => {
    console.log("Mint Paused!");
    console.log("Mint paused successfully!");
    console.log("Transaction: " + data.transactionHash);
    console.log("Gas used: " + data.gasUsed.toString());
  },
});
```

The `onMutate` callback is called before the wallet opens. The `onSuccess` callback is called after the transaction is validated by the blockchain. The `onError` is called after a transaction revert.

The `console.log()` statements are used only as a simple example. You should replace these by frontend notifications that give reactive feedback to the user on your frontend.

> You don’t need to invalidate related queries in `onSuccess`. If you implement the queries as suggested in my previous post, the query invalidation will happen automatically when triggered by the smart contract events they subscribe to, which happens immediately after a successful transaction validation.
