---
layout: post
read_time: true
show_date: true
title: "Using “React Query” to mutate smart contracts (part 2)"
date: 2022-12-07
img_path: /assets/img/posts/20221207
image: Victory.jpeg
tags: [development, web3, react, react-query]
category: development
---

> NOTE: This series of articles use [TypeChain](https://github.com/dethcrypto/TypeChain) to make strongly-typed calls to Ethereum. Please check its [documentation and discussion board](https://github.com/dethcrypto/TypeChain) to learn how to set it up. It’s also assumed some knowledge of React Query.

In my [previous post](https://aalmada.github.io/Using-React-Query-to-mutate-smart-contracts-1.html) I created a custom hook that wraps the following code:

```javascript
const pause = async (contract: MyToken) => {
  const tx = await contract.pause();
  return tx.wait();
};
```

This method actually encapsulates two steps:

- `await contract.pause()` returns a `ContractTransaction`.
- `await tx.wait()` returns a `ContractReceipt`.

`ContractTransaction` contains information about the transaction before its even validated. The custom hook we have now does not give us access to it.

To improve all my mutation hooks that perform a transaction I created the following hook extension:

```javascript
import {
  UseMutationOptions,
  useMutation,
  MutationFunction,
} from "@tanstack/react-query";
import {
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/abstract-provider";

export type UseTransactionMutationOptions<
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = Omit<
  UseMutationOptions<TransactionReceipt, TError, TVariables, TContext>,
  "mutationFn"
> & {
  onTransaction?: (
    response: TransactionResponse,
    variables: TVariables
  ) => Promise<unknown> | unknown,
};

const useTransactionMutation = <
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: MutationFunction<TransactionResponse, TVariables>,
  options?: UseTransactionMutationOptions<TError, TVariables, TContext>
) => {
  return (
    useMutation < TransactionReceipt,
    TError,
    TVariables,
    TContext >
      (async (data) => {
        const response = await mutationFn(data);
        if (options?.onTransaction) await options.onTransaction(response, data);
        return await response.wait();
      },
      options)
  );
};

export default useTransactionMutation;
```

This `useTransactionMutation` extends `useMutation` to deal with a transaction execution. It takes as `mutationFn` a method that returns `ContractTransaction`, which is the first line in the `pause()` method. The extension automatically calls the `tx.wait()`. The extension also allows the use of a `onTransaction` callback that receives the `ContractTransaction` as a parameter.

This means we can now refactor the `usePause()` hook from the previous post to the following:

```javascript
import { MyToken } from "../../typechain-types";
import useTransactionMutation, {
  UseTransactionMutationOptions,
} from "../useTransactionMutation";

const usePause = (
  options?: UseTransactionMutationOptions<unknown, MyToken, unknown>
) => {
  const { mutate, ...result } = useTransactionMutation(
    (contract) => contract.pause(),
    options
  );

  return { pause: mutate, ...result };
};

export default usePause;
```

The following changes occurred:

- `options` type is now `UserTransactionMutationOptions<>`.
- The `mutationFn` is now only `contract => contract.pause()`.
- Uses `useTransactionMutation` instead of `useMutation`.

Now the custom hook can be used as follow:

```javascript
const { pause, isLoading: isPausing } = usePause({
  onMutate: () => {
    console.log("Pausing Mint!");
    console.log("Please confirm transaction on your wallet!");
  },
  onTransaction: (response) => {
    console.log("Pausing Mint!");
    console.log("Please wait for validation!");
    console.log("Transaction: " + response.hash);
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

Notice that now there is a `onTransaction` callback that is called after the user approves the transaction on the wallet.

This new callback has access to the transaction hash, and much more info, so we can, for example, show a link to the transaction on a block explorer like etherscan.

The use of `useTransactionMutation` together with the `useQuery` as explained on previous posts, allows reactive and fail proof frontends.

I hope you found this series to be helpful…
