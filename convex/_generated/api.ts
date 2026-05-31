/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _convex from "../_convex.js";
import type * as ai from "../ai.js";
import type * as andies from "../andies.js";
import type * as badges from "../badges.js";
import type * as instances from "../instances.js";
import type * as needs from "../needs.js";
import type * as onboarding from "../onboarding.js";
import type * as reflections from "../reflections.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  _convex: typeof _convex;
  ai: typeof ai;
  andies: typeof andies;
  badges: typeof badges;
  instances: typeof instances;
  needs: typeof needs;
  onboarding: typeof onboarding;
  reflections: typeof reflections;
  users: typeof users;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
