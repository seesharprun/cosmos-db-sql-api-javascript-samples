// Get environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();

// Get Identity Client
import { DefaultAzureCredential } from "@azure/identity";

// Get Cosmos Client
import { CosmosClient } from "@azure/cosmos";

// Provide required connection from environment variables
// Endpoint format: https://YOUR-RESOURCE-NAME.documents.azure.com:443/
const endpoint = process.env.COSMOS_ENDPOINT;

// Set Database name and container name with unique timestamp
const databaseName = `cosmicworks`;
const containerName = `products`;

// Authenticate to Azure Cosmos DB
const cosmosClient = new CosmosClient({ 
    endpoint, 
    aadCredentials: new DefaultAzureCredential() 
});

// Get database - must already exist
const database = cosmosClient.database(databaseName);

// Get container - must already exist
const container = await database.container(containerName);
console.log(`${container.id} container ready`);

// Data items
const items = [
    {
        "id": "08225A9E-F2B3-4FA3-AB08-8C70ADD6C3C2",
        "categoryId": "75BF1ACB-168D-469C-9AA3-1FD26BB4EA4C",
        "categoryName": "Bikes, Touring Bikes",
        "sku": "BK-T79U-50",
        "name": "Touring-1000 Blue, 50",
        "description": "The product called \"Touring-1000 Blue, 50\"",
        "price": 2384.0700000000002,
        "tags": [
            {
                "_id": "27B7F8D5-1009-45B8-88F5-41008A0F0393",
                "name": "Tag-61"
            }
        ]
    },
    {
        "id": "2C981511-AC73-4A65-9DA3-A0577E386394",
        "categoryId": "75BF1ACB-168D-469C-9AA3-1FD26BB4EA4C",
        "categoryName": "Bikes, Touring Bikes",
        "sku": "BK-T79U-46",
        "name": "Touring-1000 Blue, 46",
        "description": "The product called \"Touring-1000 Blue, 46\"",
        "price": 2384.0700000000002,
        "tags": [
            {
                "_id": "4E102F3F-7D57-4CD7-88F4-AC5076A42C59",
                "name": "Tag-91"
            }
        ]
    },
    {
        "id": "0F124781-C991-48A9-ACF2-249771D44029",
        "categoryId": "56400CF3-446D-4C3F-B9B2-68286DA3BB99",
        "categoryName": "Bikes, Mountain Bikes",
        "sku": "BK-M68B-42",
        "name": "Mountain-200 Black, 42",
        "description": "The product called \"Mountain-200 Black, 42\"",
        "price": 2294.9899999999998,
        "tags": [
            {
                "_id": "4F67013C-3B5E-4A3D-B4B0-8C597A491EB6",
                "name": "Tag-82"
            }
        ]
    }
];

// Create all items
for (const item of items) {
    
    const { resource } = await container.items.create(item);
    console.log(`'${resource.name}' inserted`);
}

// Read item by id and partitionKey - least expensive `find`
const { resource } = await container.item(items[0].id, items[0].categoryName).read();
console.log(`${resource.name} read`);

// Query by SQL - more expensive `find`
// find all items with same categoryName (partitionKey)
const querySpec = {
    query: "select * from products p where p.categoryName=@categoryName",
    parameters: [
        {
            name: "@categoryName",
            value: items[2].categoryName
        }
    ]
};

// Get items 
const { resources } = await container.items.query(querySpec).fetchAll();

// List items
for (const item of resources) {
    console.log(`${item.id}: ${item.name}, ${item.sku}`);
}

// // Delete item
const { statusCode } = await container.item(items[2].id, items[2].categoryName).delete();
console.log(`${items[2].id} ${statusCode==204 ? `Item deleted` : `Item not deleted`}`);
