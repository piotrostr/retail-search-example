/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface Attribute {
  [key: string]: any;
}

export interface ProductImage {
  uri: string;
}

export interface PriceInfo {
  currency_code: string;
  price: Number;
  original_price?: Number;
}

export interface Product {
  title: string;
  images: Array<ProductImage>;
  uri: string;
  price_info: PriceInfo;
  availability: Number;
  attributes: { [key: string]: Attribute };
  categories: Array<string>;
  description?: string;
}

export interface Result {
  id: string;
  product: Product;
}

export interface SearchResponse {
  attribution_token: string;
  results?: Array<Result>;
  next_page_token?: string;
  total_size?: number;

  // TODO(piotrostr)
  // add the `Facets` type, maybe look for the retailpb proto and get types
  // from there
  facets?: any;
}
