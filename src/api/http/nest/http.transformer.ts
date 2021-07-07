import { TransformFnParams } from 'class-transformer/types/interfaces'

export function toArray<T>(p: TransformFnParams): T[] {
  const arr = [] as T[]

  if (Array.isArray(p.value)) {
    arr.push(...p.value)
  }
  else if (p.value !== undefined) {
    arr.push(p.value)
  }

  return arr
}
