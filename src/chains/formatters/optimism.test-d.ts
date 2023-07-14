import { describe, expectTypeOf, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { RpcBlock } from '../../types/rpc.js'
import { optimism } from '../index.js'
import {
  type OptimismRpcTransaction,
  type OptimismTransaction,
  formattersOptimism,
} from './optimism.js'

describe('block', () => {
  expectTypeOf(formattersOptimism.block.format).parameter(0).toEqualTypeOf<
    Partial<RpcBlock> & {
      stateRoot: `0x${string}`
      transactions: `0x${string}`[] | OptimismRpcTransaction[]
    }
  >()
})

describe('transaction', () => {
  expectTypeOf<
    ReturnType<typeof formattersOptimism.transaction.format>['sourceHash']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<typeof formattersOptimism.transaction.format>['mint']
  >().toEqualTypeOf<bigint | undefined>()
  expectTypeOf<
    ReturnType<typeof formattersOptimism.transaction.format>['isSystemTx']
  >().toEqualTypeOf<boolean | undefined>()
})

describe('smoke', () => {
  test('block', async () => {
    const client = createPublicClient({
      chain: optimism,
      transport: http(),
    })
    const block = await getBlock(client, {
      blockNumber: 16645775n,
      includeTransactions: true,
    })

    expectTypeOf(block.transactions).toEqualTypeOf<
      `0x${string}`[] | OptimismTransaction[]
    >()
  })

  test('transaction', async () => {
    const client = createPublicClient({
      chain: optimism,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 16628100n,
      index: 0,
    })

    expectTypeOf(transaction.type).toEqualTypeOf<
      'legacy' | 'eip2930' | 'eip1559' | 'deposit'
    >()
    expectTypeOf(
      transaction.type === 'deposit' && transaction.isSystemTx,
    ).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(
      transaction.type === 'deposit' && transaction.sourceHash,
    ).toEqualTypeOf<false | `0x${string}`>()
    expectTypeOf(
      transaction.type === 'deposit' && transaction.mint,
    ).toEqualTypeOf<false | undefined | bigint>()
    expectTypeOf(
      transaction.type === 'eip1559' && transaction.isSystemTx,
    ).toEqualTypeOf<false | undefined>()
    expectTypeOf(
      transaction.type === 'eip1559' && transaction.sourceHash,
    ).toEqualTypeOf<false | undefined>()
    expectTypeOf(
      transaction.type === 'eip1559' && transaction.mint,
    ).toEqualTypeOf<false | undefined>()
  })

  test('transaction receipt', async () => {
    const client = createPublicClient({
      chain: optimism,
      transport: http(),
    })

    const transactionReceipt = await getTransactionReceipt(client, {
      hash: '0x',
    })

    expectTypeOf(transactionReceipt.l1Fee).toEqualTypeOf<bigint | null>()
    expectTypeOf(transactionReceipt.l1FeeScalar).toEqualTypeOf<number | null>()
    expectTypeOf(transactionReceipt.l1GasPrice).toEqualTypeOf<bigint | null>()
    expectTypeOf(transactionReceipt.l1GasUsed).toEqualTypeOf<bigint | null>()
  })
})
