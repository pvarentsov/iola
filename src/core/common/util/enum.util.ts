type EnumKey<TEnum> = Exclude<keyof TEnum, number>

export class EnumUtil {
  static toObject<TEnum extends Record<string, number|string>>(target: TEnum): {[K in EnumKey<TEnum>]: TEnum[K]} {
    const copy = {...target}

    Object
      .values(target)
      .forEach(value => typeof value === 'number' && delete copy[value])

    return copy
  }

  static keys<TEnum extends Record<string, number|string>>(target: TEnum): EnumKey<TEnum>[] {
    return Object.keys(EnumUtil.toObject(target)) as EnumKey<TEnum>[]
  }

  static values<TEnum extends Record<string, number|string>>(target: TEnum): TEnum[keyof TEnum][] {
    return [...new Set(Object.values(EnumUtil.toObject(target)))]
  }
}