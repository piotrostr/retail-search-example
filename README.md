# Google Search for Retail Demo

Plug'n'play demo for showcasing the Google Search for Retail on your customer's
data catalog.

## Requirements

- [Go](https://go.dev/doc/install) (>=1.19.2)
- [NodeJS](https://nodejs.org/en/) (>=16.17.1)
- [gcloud](https://cloud.google.com/sdk/docs/install) (>=421.0.0)

## Setup

If you have a `gcloud` with the right argolis environment (can be verified
through `gcloud config list`) and your @google.com account, the first part of
setup can be done through calling:

```sh
./hack/bootstrap.sh
```

There are a few convenience scripts in the `backend/hack` directory which can be
used to create a project, link an available billing account and create
a service account.

Next, accept the terms and conditions as well as enable the Retail Search
API [here](https://console.cloud.google.com/ai/retail/start). Currently the
Google Cloud Console is the only place one can do it.

After enabling the API, fill the `config.json` file in the root directory
according to the schema below:

```json
{
  // REQUIRED
  // the project ID
  "project_id": ""

  // REQUIRED
  // the branch ID based on where the catalog resides in the Google Cloud
  // Retail Center
  "branch_id": "" // (either 0, 1 or 2)

  // change the `api_base_url` in case the backend does not run over localhost
  "api_base_url": "http://localhost:8080",

  // the customer name, keep as "altostrat" or contact piotrostr@ in case you
  // would like to add another customer
  "customer": "altostrat",

  // whether to use autocomplete, TODO(piotrostr) this is not yet implemented
  "use_autocomplete": false,

  // whether to allow facets - the boxes on the left where you can pick
  // additional filters, like brand or category
  "use_facets": true,

  "search_on_type": true,

  // one of the product IDs, this is used in backend unittests
  "sample_product_id": "local:pl:PL:000096"
}
```

To start the backend proxy run in the `google-search-for-retail/backend`
directory. Note that it requires a `credentials.json` file present in that
directory from previous step. If it is not present, the `credentials.json` file
can be created by calling:

```sh
./hack/create-service-account.sh
```

in the `backend` directory. To run the backend server:

```sh
go run . --local
```

In order to run the frontend:

```sh
npm run dev
```

in the `google-search-for-retail/frontend` directory.

At this point, one should be able to open `http://localhost:5173` in the
browser to see the demo. The demo should be connected to one's Google Cloud
Retail Center without the catalog, which can be verified by searching
something. The backend should be returning no results yet successful 200 (OK)
responses.

Lastly, in order to import you can see the [Import catalog
information](https://cloud.google.com/retail/docs/upload-catalog#mc) section
for options on how to import data.

If you don't have access to a data catalog from a customer, yet still want to
use the demo, you can create it using the
`data/download_and_preprocess_products.py` and `load-products-csv-into-bq.sh`
scripts. The Python scripts requires `pip install pandas` and the BigQuery
script requires the `bq.py` command-line utility, which can be installed with
`gcloud components install bq`. Just run

```sh
cd data/
python download_and_preprocess_products.py && ./load-products-csv-into-bq.sh
```

It will create a table with ID `[project_id].products.RetailProducts_BestBuy`
that follows the JSON schema of Retail Product under the project in your
`gcloud` configuration.

Then you can follow the instructions to import the data in the Google Retail Center.

### Notes

- The demo uses default serving config and default catalog, in case one was to
  customize those, the requests in in the `frontend/src/App.tsx` file have to
  be ammended correspondingly.

- While this is not required, in case you are using BigQuery for data import
  and there is business specific logic around customer's current implementation
  and they would like to see how Google Retail Search handles their business
  rules, you can also tune the dataset and include some of their Google
  Merchant Center (GMC) labels as attributes. There is an example query of how
  to do that in the `sql/preprocess.sql` file. There, the `Products` table
  under GMC schema is pre-processed to create `ProperProducts` table under the
  Retail Product schema.

### Architecture

- The backend is a simple Go proxy that takes in the REST requests from the
  frontend, unmarshals the JSON payload into the `retailpb.SearchRequest` or
  `retailpb.CompleteQueryRequest`, makes the gRPC request using the official
  `cloud.google.com/go/retail` package and sends back the response as JSON.

- The frontend is a React application that provides an interface similar to the
  one offered in the Evaluate tab of the Google Cloud Retail Center.
