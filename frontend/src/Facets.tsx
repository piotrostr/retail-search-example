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

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";

export interface Facet {
  key: string;
  values: Array<{ FacetValue: { Value: string }; count: number }>;
}

interface FacetsProps {
  facets: Array<Facet>;
  selectedFacets: Array<Facet>;
  setSelectedFacets: (selectedFacets: Array<Facet>) => void;
}

function trimCategoryString(category: string): string {
  return category.includes(" > ")
    ? category.split(" > ").pop() ?? ""
    : category;
}

export const Facets = ({
  facets,
  selectedFacets,
  setSelectedFacets,
}: FacetsProps) => (
  <Box>
    {facets.map((facet) => (
      <Box
        key={facet.key}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 1,
          mb: 1,
          // make this a scrollable container
          maxHeight: "40vh",
          overflowY: "auto",
        }}
      >
        <Typography sx={{ fontWeight: "bold", mb: 1 }}>{facet.key}</Typography>
        {facet.values?.length &&
          facet.values.map(({ FacetValue: value, count }) => (
            <FormGroup key={value.Value}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFacets.some(
                      (selectedFacet) =>
                        selectedFacet.key === facet.key &&
                        selectedFacet.values.some(
                          (selectedFacetValue) =>
                            selectedFacetValue.FacetValue.Value === value.Value
                        )
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // find the facet with the given key and add the new value,
                        // unless the facet doesn't exist, then add it
                        setSelectedFacets(
                          selectedFacets.some(
                            (selectedFacet) => selectedFacet.key === facet.key
                          )
                            ? selectedFacets.map((selectedFacet) => {
                                if (selectedFacet.key === facet.key) {
                                  return {
                                    ...selectedFacet,
                                    values: [
                                      ...selectedFacet.values,
                                      { FacetValue: value, count },
                                    ],
                                  };
                                }
                                return selectedFacet;
                              })
                            : [
                                ...selectedFacets,
                                {
                                  key: facet.key,
                                  values: [{ FacetValue: value, count }],
                                },
                              ]
                        );
                      } else {
                        // find the facet with the given key and remove the value
                        setSelectedFacets(
                          selectedFacets.map((selectedFacet) => {
                            if (selectedFacet.key === facet.key) {
                              return {
                                ...selectedFacet,
                                values: selectedFacet.values.filter(
                                  (selectedFacetValue) =>
                                    selectedFacetValue.FacetValue.Value !==
                                    value.Value
                                ),
                              };
                            }
                            return selectedFacet;
                          })
                        );
                      }
                    }}
                  />
                }
                label={`${trimCategoryString(value.Value)} (${count})`}
                sx={{ "& .MuiTypography-root": { fontSize: "0.9rem" } }}
              />
            </FormGroup>
          ))}
      </Box>
    ))}
  </Box>
);
