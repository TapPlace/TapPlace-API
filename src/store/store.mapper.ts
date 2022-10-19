import { HttpException, Inject } from '@nestjs/common';
import baseException from 'src/baseException';
import { Store } from 'src/entities/store.entity';
import { GetPaysCehckDto } from 'src/pay/dto/get-pays-check.dto';
import { QueryRunner, Repository } from 'typeorm';
import { AroundStoreDto } from './dto/around-store';
import { CreateStoreDto } from './dto/create-store';

export class StoreMapper {
  constructor(
    @Inject('STORE_REPOSITORY')
    private storeRepository: Repository<Store>,
    @Inject('DATA_SOURCE')
    private queryRunner: QueryRunner,
  ) {}

  // 주변찾기 쿼리
  async aroundStore(aroundStoreDto: AroundStoreDto) {
    const { x1, y1, distance } = aroundStoreDto;
    let stores;
    try {
      stores = await this.storeRepository
        .createQueryBuilder('store')
        .select('*')
        .addSelect(
          `ROUND((6371*acos(cos(radians(${y1}))*cos(radians(y))*cos(radians(x) -radians(${x1}))+sin(radians(${y1}))*sin(radians(y)))),3) AS distance`,
        )
        .having(`distance <= ${distance}`)
        .orderBy('distance')
        .limit(500)
        .getRawMany();
    } catch (error) {
      if (error.sqlMessage) throw new HttpException(error.sqlMessage, 400);
      throw new HttpException(`알 수 없는 오류`, 500);
    }

    return stores;
  }

  async aroundStore2(aroundStoreDto: AroundStoreDto) {
    const { x1, y1, distance, pays, user_id } = aroundStoreDto;
    const paysToString = pays.map((pay) => `'${pay}'`).join(',');
    const stores = await this.queryRunner.query(`
      select sp.*, b.user_id as isBookmark
      from(
        select s.*,GROUP_CONCAT(p.pay) as pays
        from(
          select *,ROUND((6371*acos(cos(radians(${y1}))*cos(radians(y))*cos(radians(x) -radians(${x1}))+sin(radians(${y1}))*sin(radians(y)))),3) AS distance
          from store
          having distance <= ${distance}
          ) s
        join pay p on s.store_id = p.store_id AND 
        p.pay IN (${paysToString})
        GROUP by s.store_id
        order by distance
        ) sp
      left join bookmark b
      on sp.store_id = b.store_id AND b.user_id = '${user_id}';
      `);

    return stores;
  }

  // 가게 생성 쿼리
  async createStore(
    createStoreDto: CreateStoreDto | GetPaysCehckDto,
  ): Promise<Store> {
    const {
      store_id,
      place_name,
      address_name,
      road_address_name,
      category_group_name,
      phone,
      x,
      y,
    } = createStoreDto;
    const store = this.storeRepository.create({
      store_id,
      place_name,
      address_name,
      road_address_name,
      category_group_name,
      phone,
      x,
      y,
    });

    try {
      await this.storeRepository.save(store);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(`store id : ${store_id} is existed`, 409);
      } else {
        throw new HttpException(`Unkown error please contact the manager`, 500);
      }
    }

    return store;
  }

  async getStoreById(store_id: string): Promise<Store> {
    // let found;
    // try {
    //   found =
    // } catch (error) {
    //   if (error.sqlMessage) throw new HttpException(error.sqlMessage, 400);
    //   throw new HttpException(`알 수 없는 오류`, 500);
    // }
    const found = await baseException(
      await this.storeRepository.findOneBy({
        store_id: store_id,
      }),
    );
    return found;
  }

  async getStoreById2(store_ids: string[]): Promise<Store[]> {
    let where = '';
    for (let i = 0; i < store_ids.length; i++) {
      if (i === 0) where += `'${store_ids[i]}'`;
      else where += `,'${store_ids[i]}'`;
    }
    // for(let store_id of store_ids) where
    return await this.storeRepository
      .createQueryBuilder()
      .select('*')
      .where(`store_id in (${where})`)
      .getRawMany();
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository
      .createQueryBuilder('store')
      .limit(100)
      .getMany();
  }

  async deleteStore(id: string) {
    return await this.storeRepository.delete({
      store_id: id,
    });
  }

  async getCountById(store_id: string): Promise<Store> {
    const found = await this.storeRepository
      .createQueryBuilder()
      .select('count(*) as count')
      .where(`store_id = '${store_id}'`)
      .getRawOne();
    return found;
  }
}
