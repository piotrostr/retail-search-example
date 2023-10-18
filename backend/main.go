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
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"

	retail "cloud.google.com/go/retail/apiv2alpha"
	"cloud.google.com/go/retail/apiv2alpha/retailpb"
	"github.com/fsnotify/fsnotify"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"

	"github.com/spf13/viper"
)

// if running locally, use credentials.json
var runningLocally = flag.Bool("local", false, "running locally")

func GetProduct(productName string) *retailpb.Product {
	client, err := retail.NewProductClient(ctx, option.WithCredentialsFile("credentials.json"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	req := &retailpb.GetProductRequest{
		Name: productName,
	}

	res, err := client.GetProduct(ctx, req)
	if err != nil {
		log.Fatal(err)
	}

	return res
}

func MakeSearchHandler(client *retail.SearchClient) func(c *gin.Context) {
	return func(c *gin.Context) {
		var req retailpb.SearchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		it := client.Search(ctx, &req)

		// even though it.Response is returned, it is not populated and
		// iterating through the results below is required
		p := iterator.NewPager(it, int(req.PageSize), req.PageToken)
		res := []*retailpb.SearchResponse_SearchResult{}
		_, err := p.NextPage(&res)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			log.Println(err)
			return
		}

		c.JSON(200, it.Response)
	}
}

func MakeAutoCompleteHandler(client *retail.CompletionClient) func(c *gin.Context) {
	return func(c *gin.Context) {
		var req retailpb.CompleteQueryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		res, err := client.CompleteQuery(ctx, &req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			log.Println(err)
			return
		}

		c.JSON(200, gin.H{"results": res.GetCompletionResults()})
	}
}

func SetupRouter(
	searchClient *retail.SearchClient,
	completionClient *retail.CompletionClient,
) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	// `cors.Default()` allows all origins
	router.Use(cors.Default())

	v1 := router.Group("/api/v1")
	v1.POST("/search", MakeSearchHandler(searchClient))
	v1.POST("/autocomplete", MakeAutoCompleteHandler(completionClient))
	return router
}

var ctx = context.Background()

func PrettyString(v any) string {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	return string(b)
}

func ReadInConfig() error {
	viper.SetConfigName("config")
	viper.AddConfigPath("../")
	err := viper.ReadInConfig()
	if err != nil {
		return err
	}

	// validate
	if !viper.IsSet("project_id") || viper.GetString("project_id") == "" {
		return fmt.Errorf("project ID not set")
	}

	if !viper.IsSet("branch_id") || viper.GetString("branch_id") == "" {
		return fmt.Errorf("branch ID not set")
	}

	config := viper.AllSettings()
	log.Println("\"config\":", PrettyString(config))

	viper.WatchConfig()
	viper.OnConfigChange(func(e fsnotify.Event) {
		log.Println("Config file changed:", e.Name)
		config := viper.AllSettings()
		log.Println(PrettyString(config))
	})

	return nil
}

func main() {
	flag.Parse()

	if err := ReadInConfig(); err != nil {
		log.Fatal(err)
	}

	var opts []option.ClientOption
	if *runningLocally {
		opts = append(opts, option.WithCredentialsFile("credentials.json"))
	}
	searchClient, err := retail.NewSearchClient(ctx, opts...)
	if err != nil {
		log.Fatal(err)
	}
	defer searchClient.Close()

	completionClient, err := retail.NewCompletionClient(ctx, opts...)
	if err != nil {
		log.Fatal(err)
	}
	defer completionClient.Close()

	router := SetupRouter(searchClient, completionClient)

	log.Println("Listening on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
