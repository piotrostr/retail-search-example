-- Copyright 2023 Google LLC
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

  # notice this uses a workaround with IFNULL() for nullable fields
INSERT INTO
  `p-demo-ctr.me.ProperProducts` ( id,
    primaryProductId,
    categories,
    title,
    description,
    attributes,
    uri,
    tags,
    images,
    priceInfo )
SELECT
  product_id AS id,
  product_id AS primaryProductId,
  [ IFNULL(google_product_category_path, "") ] AS categories,
  title AS title,
  description AS description,
  [ STRUCT( "label_0" AS KEY,
    STRUCT( [ IFNULL(custom_labels.label_0, "") ] AS text,
      ARRAY<FLOAT64>[] AS numbers) AS value ),
  STRUCT( "label_1" AS KEY,
    STRUCT( [ IFNULL(custom_labels.label_1, "") ] AS text,
      ARRAY<FLOAT64>[] AS numbers) AS value ),
  STRUCT( "label_2" AS KEY,
    STRUCT( [ IFNULL(custom_labels.label_2, "") ] AS text,
      ARRAY<FLOAT64>[] AS numbers) AS value ),
  STRUCT( "label_3" AS KEY,
    STRUCT( [ IFNULL(custom_labels.label_3, "") ] AS text,
      ARRAY<FLOAT64>[] AS numbers) AS value ),
  STRUCT( "label_4" AS KEY,
    STRUCT( [ IFNULL(custom_labels.label_4, "") ] AS text,
      ARRAY<FLOAT64>[] AS numbers) AS value ),
  STRUCT( "brand" AS KEY,
    STRUCT( [IFNULL(brand, "")] AS text,
      ARRAY<FLOAT64>[] AS numbers) AS value) ] AS attributes,
  link AS uri,
  ARRAY<STRING>[ IFNULL(custom_labels.label_0, ""),
  IFNULL(custom_labels.label_1, ""),
  IFNULL(custom_labels.label_2, ""),
  IFNULL(custom_labels.label_3, ""),
  IFNULL(custom_labels.label_4, "") ] AS tags,
  ARRAY_CONCAT( [STRUCT(image_link AS uri,
      NULL AS width,
      NULL AS height)], ARRAY(
    SELECT
      STRUCT(uri AS uri,
        NULL AS width,
        NULL AS height)
    FROM
      UNNEST(additional_image_links) AS uri ) ) AS images,
  STRUCT(price.currency AS currencyCode,
    CAST(sale_price.value AS FLOAT64) AS price,
    CAST(price.value AS FLOAT64) AS originalPrice,
    CAST(NULL AS FLOAT64) AS cost,
    CAST(NULL AS STRING) AS priceEffectiveTime,
    CAST(NULL AS STRING) AS priceExpireTime) AS priceInfo
FROM
  `p-demo-ctr.me.Products`
WHERE
  product_id IS NOT NULL
  AND title IS NOT NULL
  AND description IS NOT NULL
  AND image_link IS NOT NULL;
