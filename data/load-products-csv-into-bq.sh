#!/bin/bash

# Script below creates a table with the Retail Product Schema and inserts data
# from the JSONL file generated in the preprocess.py script

DATASET=products
TABLE_NAME=RetailProducts_BestBuy

# create the dataset if it doesn't exist
bq mk $DATASET

bq load \
  --source_format=NEWLINE_DELIMITED_JSON \
  $DATASET.$TABLE_NAME \
  ./retail-products.jsonl \
  ./retail-product-schema.json
