// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	retail "cloud.google.com/go/retail/apiv2alpha"
	"github.com/spf13/viper"
	"google.golang.org/api/option"
)

func Setup(t *testing.T) (*retail.SearchClient, *retail.CompletionClient) {
	if err := ReadInConfig(); err != nil {
		t.Fatal(err)
	}

	opts := []option.ClientOption{
		option.WithCredentialsFile("credentials.json"),
	}

	completionClient, err := retail.NewCompletionClient(ctx, opts...)
	if err != nil {
		t.Fatal(err)
	}
	searchClient, err := retail.NewSearchClient(ctx, opts...)
	if err != nil {
		t.Fatal(err)
	}

	return searchClient, completionClient
}

func TestSearch(t *testing.T) {
	searchClient, completionClient := Setup(t)
	defer searchClient.Close()
	defer completionClient.Close()

	router := SetupRouter(searchClient, completionClient)

	w := httptest.NewRecorder()
	body, err := json.Marshal(map[string]any{
		"query": "waga",
		"placement": fmt.Sprintf(
			"projects/%s/locations/global/catalogs/default_catalog/placements/default_search",
			viper.GetString("project_id"),
		),
		"branch": fmt.Sprintf(
			"projects/%s/locations/global/catalogs/default_catalog/branches/%s",
			viper.GetString("project_id"),
			viper.GetString("branch_id"),
		),
		"page_size":  1,
		"offset":     0,
		"visitor_id": "1234567890",
		"facet_specs": []any{
			map[string]any{
				"key": "attributes.label_3",
			},
		},
	})
	if err != nil {
		log.Fatal(err)
	}
	req, _ := http.NewRequest("POST", "/api/v1/search", bytes.NewBuffer(body))
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status code 200, got %d", w.Code)
	}

	var res map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatal(err)
	}
}

func TestGetProduct(t *testing.T) {
	searchClient, completionClient := Setup(t)
	defer searchClient.Close()
	defer completionClient.Close()

	productName := fmt.Sprintf(
		"projects/%s/locations/global/catalogs/default_catalog/branches/2/products/%s",
		viper.GetString("project_id"),
		viper.GetString("sample_product_id"),
	)
	res := GetProduct(productName)
	if res.String() == "" {
		t.Errorf("Expected product, got nil")
	}
}

func TestAutcomplete(t *testing.T) {
	searchClient, completionClient := Setup(t)
	defer searchClient.Close()
	defer completionClient.Close()

	router := SetupRouter(searchClient, completionClient)

	w := httptest.NewRecorder()
	body, err := json.Marshal(map[string]any{
		"query": "kompu",
		"catalog": fmt.Sprintf(
			"projects/%s/locations/global/catalogs/default_catalog",
			viper.GetString("project_id"),
		),
	})
	if err != nil {
		log.Fatal(err)
	}
	req, _ := http.NewRequest("POST", "/api/v1/autocomplete", bytes.NewBuffer(body))
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status code 200, got %d", w.Code)
	}
}
