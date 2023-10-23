export interface IDataAdapter {
  tableName:string;

  putItem(item: {}): void;

  updateItem(item: {}): void;

  query(params: {}): Promise<object>;

  getAll(): Promise<object>;
}