import { TransformFnParams } from 'class-transformer/types/interfaces'

export function toArray<T>(p: TransformFnParams): T[] {
  const arr = [] as T[]
  const emptyValues = ['', undefined]

  if (Array.isArray(p.value)) {
    arr.push(...p
      .value
      .filter(v => !emptyValues.includes(v))
    )
  }
  else if (!emptyValues.includes(p.value)) {
    arr.push(p.value)
  }

  return arr
}
