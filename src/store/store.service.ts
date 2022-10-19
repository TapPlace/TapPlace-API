import { Injectable } from '@nestjs/common';
import { BookmarkMapper } from 'src/bookmark/bookmark.mapper';
import { Store } from 'src/entities/store.entity';
import { PayMapper } from 'src/pay/pay.mapper';
import { AroundStoreDto } from './dto/around-store';
import { CreateStoreDto } from './dto/create-store';

import { StoreMapper } from './store.mapper';

@Injectable()
export class StoreService {
  constructor(
    private storeMapper: StoreMapper,
    private payMapper: PayMapper,
    private bookmarkMapper: BookmarkMapper,
  ) {}

  // (구) 주변찾기
  // async aroundStore(aroundStoreDto: AroundStoreDto) {
  //   // 전달받은 pay 배열
  //   const { pays } = aroundStoreDto;
  //   // 주변 가게 먼저 가져옴
  //   const stores = await this.storeMapper.aroundStore(aroundStoreDto);
  //   // 해당 가게 stores 값 + pay 추가해서 리턴할 배열
  //   const result = {
  //     stores: [],
  //   };

  //   for await (const store of stores) {
  //     // pays 중에 존재하는 pay만 담을 배열
  //     const paysResult = [];
  //     for await (const pay of pays) {
  //       // pays 존재 check
  //       const start = new Date().getTime();
  //       const payExist = await this.payMapper.payCheck(store['store_id'], pay);
  //       const end = new Date().getTime();
  //       console.log(store, pay, payExist, end - start);
  //       if (payExist) {
  //         paysResult.push(pay);
  //       }
  //     }
  //     //해당 store에 pays 가있어야만 리턴
  //     if (paysResult.length) {
  //       store['pays'] = paysResult;
  //       result['stores'].push(store);
  //     }
  //   }

  //   return result;
  // }

  //dev
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = await this.storeMapper.createStore(createStoreDto);
    return store;
  }

  async getStoreById(store_id: string): Promise<Store> {
    const store = await this.storeMapper.getStoreById(store_id);
    return store;
  }

  async findAll(): Promise<Store[]> {
    return await this.storeMapper.findAll();
  }

  async deleteStore(id: string) {
    return await this.storeMapper.deleteStore(id);
  }

  // async aroundStore2(aroundStoreDto: AroundStoreDto) {
  //   // 전달받은 pay 배열
  //   const { pays } = aroundStoreDto;
  //   // 주변 가게 먼저 가져옴
  //   const stores = await this.storeMapper.aroundStore(aroundStoreDto);
  //   // 해당 가게 stores 값 + pay 추가해서 리턴할 배열
  //   const result = {
  //     stores: [],
  //   };

  //   for await (const store of stores) {
  //     // pays 중에 존재하는 pay만 담을 배열
  //     const paysResult = [];
  //     for await (const pay of pays) {
  //       // pays 존재 check
  //       const start = new Date().getTime();
  //       const payExist = await this.payMapper.payCheck2(store['store_id'], pay);
  //       const end = new Date().getTime();
  //       console.log(store, pay, payExist, end - start);
  //       if (payExist) {
  //         paysResult.push(pay);
  //       }
  //     }
  //     // 해당 store에 pays 가있어야만 리턴
  //     if (paysResult.length) {
  //       store['pays'] = paysResult;
  //       result['stores'].push(store);
  //     }
  //   }

  //   return result;
  // }

  async aroundStore(aroundStoreDto: AroundStoreDto) {
    // 전달받은 pay 배열
    const { pays, user_id } = aroundStoreDto;
    // 주변 가게 먼저 가져옴
    const stores = await this.storeMapper.aroundStore(aroundStoreDto);
    // 해당 가게 stores 값 + pay 추가해서 리턴할 배열
    const result = {
      stores: [],
    };
    let bookmarkStores;
    const isBookmark = {};
    if (user_id !== '') {
      bookmarkStores = await this.bookmarkMapper.getStoreIds(user_id, stores);
      for (const bookmarkStore of bookmarkStores) {
        isBookmark[bookmarkStore['store_id']] = true;
      }
    }

    for await (const store of stores) {
      // pays 중에 존재하는 pay만 담을 배열
      const paysResult = [];
      const payExist = await this.payMapper.payCheck3(store['store_id'], pays);
      for (const pay of payExist) {
        paysResult.push(pay['pay']);
      }
      // 해당 store에 pays 가있어야만 리턴
      if (paysResult.length) {
        store['pays'] = paysResult;
        if (user_id !== '') {
          if (isBookmark[store['store_id']]) store['isBookmark'] = true;
          else store['isBookmark'] = false;
        }
        result['stores'].push(store);
      }
    }

    return result;
  }

  async aroundStore2(aroundStoreDto: AroundStoreDto) {
    // 전달받은 pay 배열
    const { pays, user_id } = aroundStoreDto;
    // 주변 가게 먼저 가져옴
    const stores = await this.storeMapper.aroundStore2(aroundStoreDto);

    stores.map((store) => {
      store['pays'] = store['pays'].split(',');
      if (store['isBookmark']) store['isBookmark'] = true;
      else store['isBookmark'] = false;
    });
    return {
      stores,
    };
  }
}
