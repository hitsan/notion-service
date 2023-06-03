import {QueryDatabaseResponse, PageObjectResponse} from "@notionhq/client/build/src/api-endpoints.d";

const result: PageObjectResponse[] = [
    {
      "object": "page",
      "id": "4d7afa67-0601-44fe-829a-f1c487358308",
      "created_time": "2023-05-05T06:13:00.000Z",
      "last_edited_time": "2023-05-05T07:43:00.000Z",
      "created_by": {
        "object": "user",
        "id": "337e5d99-d3ac-410b-baf9-a96d2e28c5ad"
      },
      "last_edited_by": {
        "object": "user",
        "id": "337e5d99-d3ac-410b-baf9-a96d2e28c5ad"
      },
      "cover": null,
      "icon": null,
      "parent": {
        "type": "database_id",
        "database_id": "3b8962d8-cefe-4581-ba83-45244330673f"
      },
      "archived": false,
      "properties": {
        "Author": {
          "id": "AYg~",
          "type": "rich_text",
          "rich_text": []
        },
        "Status": {
          "id": "A%7BNP",
          "type": "select",
          "select": null
        },
        "Rating": {
          "id": "DM~%7D",
          "type": "select",
          "select": null
        },
        "Categry": {
          "id": "FeGM",
          "type": "select",
          "select": {
            "id": "BprW",
            "name": "Book",
            "color": "brown"
          }
        },
        "Image": {
          "id": "NyMw",
          "type": "files",
          "files": []
        },
        "Date": {
          "id": "%5B_C%7D",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [],
            "function": "show_original"
          }
        },
        "PublishedDate": {
          "id": "hVV%5B",
          "type": "date",
          "date": null
        },
        "Tag": {
          "id": "j%5EsR",
          "type": "multi_select",
          "multi_select": []
        },
        "URL": {
          "id": "nxA%40",
          "type": "url",
          "url": null
        },
        "testLifelog": {
          "id": "tI~%3D",
          "type": "relation",
          "relation": []
        },
        "Title": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "ハリー・ポッターと賢者の石",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "ハリー・ポッターと賢者の石",
              "href": null
            }
          ]
        }
      },
      "url": "https://www.notion.so/4d7afa67060144fe829af1c487358308"
    }
  ]

export const mockedData: QueryDatabaseResponse = {
  type: "page",
  page: {},
  object: "list",
  next_cursor: null,
  has_more: false,
  results: result,
};