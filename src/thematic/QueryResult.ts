export class QueryResult<T extends Record<string, unknown> = Record<string, unknown>> {
  constructor(public data: T) {}

  getSize(): number {
    return Object.keys(this.data).length;
  }
}
