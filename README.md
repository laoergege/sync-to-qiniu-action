
<p align="center">
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

# sync-to-qiniu-action

This action can synchronize files in the path you specified to [qiniu(KODO)](https://www.qiniu.com/products/kodo), including delete, modify, and move&rename operations.

## Pre-requisites

## Input

|            | required | default              | description                                                  |
| ---------- | -------- | -------------------- | ------------------------------------------------------------ |
| accessKey  | true     |                      | qiniu accessKey                                              |
| secretKey  | true     |                      | qiniu secretKey                                              |
| bucket     | true     |                      | qiniu bucket                                                 |
| zone       | true     |                      | bucket zone                                                  |
| path       | true     |                      | the path under files you want to upload                      |
| token      | true     |                      | a token with access to your repository scoped in as a secret |
| fsizeLimit | false    | 5 * 1024 * 1024 byte | maximum upload file size limit(byte)                         |
| mimeLimit  | false    |                      | File MimeType                                                |


## Example Usage

in your workflow
```yml
- uses: laoergege/sync-to-qiniu-action@v1
      with:
        accessKey: ${{ secrets.accessKey }}
        secretKey: ${{ secrets.secretKey }}
        bucket: ''
        zone: ''
        path: ''
        token: ${{ secrets.GITHUB_TOKEN }}
```
