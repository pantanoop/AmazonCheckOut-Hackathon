import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SalesProduct } from '../sales-product/sales-product.entity';

export default class SalesProductSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(SalesProduct);

    const count = await repository.count();
    if (count > 0) return;

    await repository.insert([
      {
        productId: 'b17f77ae-5d5d-4183-a1f5-979c45a5f57f',
        price: 89.99,
      },
      {
        productId: '2b8a7b36-fb21-4ad8-a124-25d607c3e55c',
        price: 59.99,
      },
      {
        productId: '7c91f4b0-8d42-47f1-98c4-b3f975be3a41',
        price: 149.99,
      },
      {
        productId: 'e7a23cbb-4c59-4233-8d38-f2b82c3f949e',
        price: 19.99,
      },
      {
        productId: '9f3e1a65-5af7-4d1a-a08b-6d7c78d8a19e',
        price: 299.99,
      },
    ]);
  }
}
