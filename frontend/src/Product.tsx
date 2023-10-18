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

import { useMemo } from "react";
import {
  Stack,
  Box,
  Link,
  Typography,
  Button,
  Rating,
  Divider,
} from "@mui/material";
import { Product } from "./types";

export function Product({ product }: { product: Product }) {
  // random rating between 3 and 5 with halfs (e.g. 3.5, 4.5)
  const numStars = useMemo(
    () => Math.floor(Math.random() * 3) + 3 + Math.random() / 2,
    []
  );

  return (
    <Box
      sx={{
        maxWidth: {
          xs: 400,
          sm: 500,
          md: 600,
          lg: 700,
        },
        margin: "auto",
        border: "1px solid",
        borderColor: "grey.300",
        mb: 2,
        display: "flex",
        flexDirection: {
          xs: "column",
          sm: "row",
        },
      }}
    >
      <Stack flex={2} p={2}>
        <Link
          href={product.uri}
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 1 }}>
            {product.title}
          </Typography>
          {product?.attributes?.points &&
          product?.attributes?.points?.numbers[0] !== 0 ? (
            <Typography sx={{ fontSize: "0.8rem", mb: 1, color: "grey.500" }}>
              Points (debug): {product?.attributes?.points?.numbers[0]}
            </Typography>
          ) : null}
          {product?.attributes?.label_3 &&
          product?.attributes?.label_3?.text[0] ? (
            <Typography sx={{ fontSize: "0.8rem", mb: 1, color: "grey.500" }}>
              Label_3 (debug): {product?.attributes?.label_3?.text[0]}
            </Typography>
          ) : null}
          <Rating
            name="read-only"
            precision={0.5}
            value={numStars}
            sx={{ mb: 2 }}
          />
        </Link>
        <Link
          href={product.uri}
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          {product.images && (
            <img
              src={product.images[0].uri}
              alt={product.title}
              width={150}
              height={150}
            />
          )}
        </Link>
        <Typography
          sx={{
            fontSize: "0.8rem",
            mt: 1,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {product.description}
        </Typography>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack
        flex={1}
        p={4}
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        {
          // case where there is only the original price
          product?.price_info?.original_price && !product?.price_info?.price ? (
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "3rem",
                mb: 1,
                color: "red",
              }}
            >
              {product?.price_info?.original_price.toFixed(2).toString()}
            </Typography>
          ) : (
            <Box>
              {
                // case where there are both prices but they are equal
                product?.price_info?.original_price &&
                product?.price_info?.price &&
                product?.price_info?.original_price ===
                  product?.price_info?.price ? (
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "3rem",
                      mb: 1,
                      color: "red",
                    }}
                  >
                    {product?.price_info?.price?.toFixed(2).toString()}
                  </Typography>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize: "1.2rem",
                        textDecoration: "line-through",
                        lineHeight: "1rem",
                        mt: 1,
                      }}
                    >
                      {product?.price_info?.original_price
                        ?.toFixed(2)
                        .toString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: "3rem",
                        mb: 1,
                        color: "red",
                      }}
                    >
                      {product?.price_info?.price?.toFixed(2).toString()}
                    </Typography>
                  </>
                )
              }
            </Box>
          )
        }
        <Button
          sx={{
            mb: 2,
            color: "#000000",
            borderRadius: 0,
            "&:hover": {
              backgroundColor: "primary.main",
            },
            height: "3rem",
          }}
          color="primary"
          variant="contained"
        >
          Do Koszyka
        </Button>
      </Stack>
    </Box>
  );
}
