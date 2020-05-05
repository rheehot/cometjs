import type {
  Option,
  MapReturnType,
  InferrableAny,
  OverrideProps,
  Callable,
  None,
  Some,
} from '@cometjs/core';
import { isNone } from '@cometjs/core';
import { mapToValue } from '@cometjs/core';

/**
 * An abstract type has serval subtypes based on `__typename` field.
 * Such as the GraphQL's interface/union response.
 */
export type GraphQLAbstractType<TSubtype extends string> = {
  __typename?: TSubtype,
};
export type Union<TSubtype extends string> = GraphQLAbstractType<TSubtype>;
export type Interface<TSubtype extends string> = GraphQLAbstractType<TSubtype>;

// Force-infer `__typename` property as literal than string
export type SubtypeName<T> = T extends GraphQLAbstractType<infer TType> ? TType : never;


/**
 * Subtype mapper utility for GraphQL interface/union type response.
 *
 * @param object
 * @param subtypeMatcher Subtype mappers
 *
 * @return Return value of the mapper function for matched subtype
 */
export function mapAbstractType<
  TAbstract extends GraphQLAbstractType<string>,
  TSubtype extends SubtypeName<TAbstract>,
  TSubtypeMatcher extends {
    [TKey in TSubtype]: (
      | ((match: Extract<TAbstract, GraphQLAbstractType<TKey>>) => any)
      | InferrableAny
    );
  },
>(
  object: TAbstract,
  subtypeMatcher: TSubtypeMatcher,
): MapReturnType<TSubtypeMatcher> {
  if (typeof object !== 'object') {
    throw new Error('The given value is not an object');
  }
  if (!object.__typename) {
    throw new Error('The given object doesn\'t have `__typename` property');
  }
  const mapFn = subtypeMatcher[object.__typename as TSubtype];
  // eslint-disable-next-line
  return mapToValue(mapFn, object as any) as MapReturnType<TSubtypeMatcher>;
}
export const mapUnion = mapAbstractType;
export const mapInterface = mapAbstractType;

/**
 * Subtype mapper utility for GraphQL interface/union type response.
 *
 * @param object
 * @param subtypeMatcher Subtype mappers that can be/returns optional.\
 * This should have additional map in `_` so use it as fallback for unmatched/none value.
 *
 * @return Return value of the mapper for matched subtype or the default mapper
 */
export function mapAbstractTypeWithDefault<
  TAbstract extends GraphQLAbstractType<string>,
  TSubtype extends SubtypeName<TAbstract>,
  TSubtypeMatcher extends {
    [TKey in TSubtype]?: (
      | ((match: Extract<TAbstract, GraphQLAbstractType<TKey>>) => any)
      | InferrableAny
    );
  },
  RDefault extends (
    | ((object: Option<TAbstract>) => any)
    | InferrableAny
  ),
>(
  object: Option<TAbstract>,
  subtypeMatcher: TSubtypeMatcher & {
    _: RDefault,
  },
): (
  | MapReturnType<TSubtypeMatcher>
  | RDefault extends infer T
    ? T extends Callable
    ? ReturnType<T>
    : T
    : never
) {
  const defaultMapFn = subtypeMatcher['_'];
  if (isNone(object)) {
    return mapToValue(defaultMapFn, object);
  }
  if (typeof object !== 'object') {
    throw new Error('The given value is not an object');
  }
  if (!object.__typename) {
    throw new Error('The given object doesn\'t have `__typename` property');
  }
  const mapFn = subtypeMatcher[object.__typename as TSubtype];
  if (mapFn) {
    // eslint-disable-next-line
    return mapToValue(mapFn, object as any)
  } else {
    return mapToValue(defaultMapFn, object);
  }
}
export const mapUnionWithDefault = mapAbstractTypeWithDefault;
export const mapInterfaceWithDefault = mapAbstractTypeWithDefault;
