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

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Autocomplete,
  TextField,
  InputAdornment,
  Container,
  Button,
  IconButton,
} from "@mui/material";
import { Product } from "./Product";
import { SearchResponse, Result } from "./types";
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import config from "../../config.json";
import { CustomerLogo } from "./CustomerLogo";
import { type Facet, Facets } from "./Facets";

// TODO(piotrostr) replace the current pagination solution with the Material UI pagination

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Array<Result>>([]);
  const [pageSize, _setPageSize] = useState<number>(8);
  const [nextPageToken, setNextPageToken] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [facets, setFacets] = useState<Array<Facet>>([]);
  const [selectedFacets, setSelectedFacets] = useState<Array<Facet>>([]);

  function makeFilterString(facets: Array<Facet>): string {
    return facets.some((facet) => facet.values.length !== 0)
      ? facets
          .filter((facet) => facet.values.length !== 0)
          .map(
            (facet) =>
              `${facet.key}: ANY(${facet.values
                .map((value) => `"${value.FacetValue.Value}"`)
                .join(",")})`
          )
          .join(" AND ")
      : "";
  }

  function makeOrderByString(): string {
    if (config.use_points_and_hardcoded_list) {
      const queriesList = [
        "zmywarki do zabudowy",
        "pralki mix",
        "smartwatche",
        "telewizory",
        "smartfony",
        "ekspresy automatyczne",
        "klawiatury",
        "klawiatury gamingowe",
        "hulajnogi elektryczne",
      ];
      return queriesList.includes(query) ? "attributes.points desc" : "";
    }
    return "";
  }

  async function search(
    query: string,
    nextPageToken: string,
    fetchNextPage: boolean = false
  ): Promise<void> {
    try {
      setLoading(true);
      setNoResults(false);
      const response = await fetch(config.api_base_url + "/api/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          placement: `projects/${config.project_id}/locations/global/catalogs/default_catalog/placements/default_search`,
          branch: `projects/${config.project_id}/locations/global/catalogs/default_catalog/branches/${config.branch_id}`,
          page_size: pageSize,
          visitor_id: crypto.randomUUID(), //  this can be obtained from the Google Tag, random string for now
          page_token: fetchNextPage ? nextPageToken : "",
          filter: makeFilterString(selectedFacets),
          order_by: makeOrderByString(),
          facet_specs: [
            { facet_key: { key: "availability" } },
            { facet_key: { key: "categories" } },
          ],
        }),
      });
      const data = (await response.json()) as SearchResponse;
      data?.next_page_token && setNextPageToken(data.next_page_token);
      data?.total_size && setTotalSize(data.total_size);
      data?.facets && setFacets(data.facets);
      if (
        data.results === null ||
        data?.results?.length === 0 ||
        !data.results
      ) {
        setNoResults(true);
      } else {
        if (fetchNextPage) {
          // `data.results` is known to be not null here
          setResults((results) => [...results, ...data.results!]);
        } else {
          setResults(data.results);
        }
      }
      console.log(data);
    } catch (error) {
      console.log("error:", error);
    } finally {
      setLoading(false);
    }
  }

  const options = [
    "śrubokręt",
    "waga kuchenna",
    "robot kuchenny z waga",
    "robot kuchenny",
    "podkładka",
    "pad ps5",
    "klawiatura",
    "mysz dla gracza",
  ];

  const autocompleteLoading = open && options.length === 0;

  function clear() {
    setQuery("");
    setResults([]);
    setNextPageToken("");
    setNoResults(false);
    setTotalSize(0);
  }

  useEffect(() => {
    if (query == "") {
      clear();
    }
  }, [query]);

  useEffect(() => {
    if (query !== "") {
      search(query, "");
    }
  }, [selectedFacets]);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#000000",
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: 1,
            width: {
              xs: 500,
              sm: 800,
              md: 900,
              lg: 1000,
            },
          }}
        >
          <CustomerLogo />
          <Box
            sx={{
              width: {
                xs: 200,
                sm: 400,
                md: 500,
                lg: 550,
              },
              margin: "auto",
              backgroundColor: "white",
            }}
          >
            {config.use_autocomplete ? (
              <Autocomplete
                id="search-demo"
                options={options}
                isOptionEqualToValue={(option, value) => option === value}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                loading={autocompleteLoading}
                getOptionLabel={(option) => option}
                onChange={(_, value) => {
                  if (value) {
                    setQuery(value);
                    search(value, nextPageToken);
                  }
                }}
                onInputChange={(_, value) => {
                  if (value && config.search_on_type) {
                    setQuery(value);
                    search(value, nextPageToken);
                  }
                }}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    search(query, nextPageToken);
                  }
                }}
                forcePopupIcon={false}
                // when the value prop is not equal to any of the options
                // suggested this raises an annoying warning; the walkaround is
                // not optimal but works since there will always be >10 options
                value={options.includes(query) ? query : null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ paddingRight: 1 }}
                    label=""
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {autocompleteLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          <Box
                            onClick={() => search(query, nextPageToken)}
                            sx={{ cursor: "pointer" }}
                          >
                            <InputAdornment position="end">
                              <SearchIcon />
                            </InputAdornment>
                          </Box>
                          <Box onClick={clear}>
                            {params.InputProps.endAdornment}
                          </Box>
                        </>
                      ),
                    }}
                  />
                )}
              />
            ) : (
              <TextField
                sx={{ paddingRight: 1, width: "100%" }}
                label=""
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (config.search_on_type && event.target.value !== "") {
                    search(event.target.value, nextPageToken);
                  }
                }}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    search(query, nextPageToken);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      <Box
                        onClick={() => search(query, nextPageToken)}
                        sx={{ cursor: "pointer" }}
                      >
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      </Box>
                      {query && (
                        <Box onClick={clear} sx={{ cursor: "pointer" }}>
                          <InputAdornment position="end">
                            <ClearIcon />
                          </InputAdornment>
                        </Box>
                      )}
                    </>
                  ),
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: 70,
            }}
          >
            <IconButton sx={{ color: "white" }}>
              <PersonIcon />
            </IconButton>
            <IconButton sx={{ color: "white" }}>
              <ShoppingCartIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <>
        <Container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          {config.use_facets && query !== "" && (
            <Facets
              facets={facets}
              selectedFacets={selectedFacets}
              setSelectedFacets={setSelectedFacets}
            />
          )}
          <Container
            sx={{
              overflowY: "auto",
              height: "calc(100vh - 150px)",
            }}
          >
            {noResults ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography sx={{ marginTop: 2 }} variant="h6">
                  Brak wyników
                </Typography>
              </Box>
            ) : (
              results.map(({ id, product }) => (
                <Product key={id} product={product} />
              ))
            )}
            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                  color: "#000000",
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
            {totalSize > results?.length && !loading && !noResults && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ marginTop: 2 }} variant="h6">
                  {results?.length} z {totalSize}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() =>
                    search(query, nextPageToken, /*fetchNextPage*/ true)
                  }
                  sx={{ height: 40, width: 200, marginTop: 1 }}
                >
                  Pokaż więcej
                </Button>
              </Box>
            )}
          </Container>
        </Container>
      </>
    </>
  );
}
