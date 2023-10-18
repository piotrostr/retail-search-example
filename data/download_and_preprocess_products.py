#!/usr/bin/env python

import json

import pandas as pd


def preprocess_and_write_jsonl(path: str):
    df = pd.read_json(path)

    df.rename(
        columns={"name": "title", "sku": "id", "upc": "gtin", "type": "categories"},
        inplace=True,
    )

    # nest categories into list, this is a repeated field
    df["categories"] = df.apply(lambda x: [x["categories"]], axis=1)

    df["name"] = df.apply(
        lambda x: f"{x['title']} {x['manufacturer']} {x['model']}",
        axis=1,
    )

    df["priceInfo"] = df.apply(
        lambda x: {"currencyCode": "USD", "price": x["price"]},
        axis=1,
    )

    df["images"] = df.apply(lambda x: [{"uri": x["image"]}], axis=1)

    df["id"] = df["id"].astype(str)

    cols_to_drop = [
        "price",
        "manufacturer",
        "model",
        "url",
        "image",
        "category",
        "shipping",
        "gtin",
    ]
    df.drop(cols_to_drop, axis=1, inplace=True)
    df.dropna(inplace=True)
    df.info()

    # write to jsonl
    with open("retail-products.jsonl", "w") as outfile:
        for _, row in df.iterrows():
            data = row.to_dict()
            outfile.write(json.dumps(data) + "\n")


def main():
    preprocess_and_write_jsonl(
        "https://raw.githubusercontent.com/BestBuyAPIs/open-data-set/master/products.json"
    )


if __name__ == "__main__":
    main()
