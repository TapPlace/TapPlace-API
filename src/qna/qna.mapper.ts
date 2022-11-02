import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Qna } from 'src/entities/qna.entity';
import { Repository } from 'typeorm';
import { CreateQnaWebDto } from './dto/create-qna-web.dto';
import { CreateQnaDto } from './dto/create-qna.dto';

@Injectable()
export class QnaMapper {
  constructor(
    @Inject('QNA_REPOSITORY')
    private qnaRepository: Repository<Qna>,
  ) {}

  async createQna(createqnaDto: CreateQnaDto): Promise<any> {
    const { user_id, category, title, content, os, store_id } = createqnaDto;

    const result = await this.qnaRepository
      .createQueryBuilder()
      .insert()
      .into(Qna)
      .values({
        user_id,
        category,
        title,
        content,
        os,
        store_id,
        write_date: () => 'left(NOW(),19)',
      })
      .execute();

    return true;
  }

  async createQnaWeb(createqnaWebDto: CreateQnaWebDto): Promise<any> {
    const { title, content, store_id } = createqnaWebDto;

    const result = await this.qnaRepository
      .createQueryBuilder()
      .insert()
      .into(Qna)
      .values({
        user_id: 'web',
        category: 'edit',
        title,
        content,
        os: 'web',
        store_id,
        write_date: () => 'left(NOW(),19)',
      })
      .execute();

    return true;
  }

  async findQna(ct, answer_check, viewCount, startCount) {
    const result = await this.qnaRepository
      .createQueryBuilder()
      .select(`*`)
      .where(`(category = ${ct})`)
      .andWhere(`(answer_check = ${answer_check})`)
      .orderBy('num', 'DESC')
      .limit(viewCount)
      .offset(startCount)
      .getRawMany();
    return result;
  }

  async findById(user_id, viewCount, startCount) {
    const result = await this.qnaRepository
      .createQueryBuilder()
      .select(`*`)
      .where(`user_id = '${user_id}' and category='qna'`)
      .orderBy('num', 'DESC')
      .limit(viewCount)
      .offset(startCount)
      .getRawMany();
    return result;
  }

  async findByNum(num) {
    const result = await this.qnaRepository
      .createQueryBuilder()
      .select(`*`)
      .where(`num = ${num}`)
      .getRawOne();
    return result;
  }

  async getTotalCount(ct, answer_check) {
    return await this.qnaRepository
      .createQueryBuilder()
      .select('count(*) as count')
      .where(`(category = ${ct})`)
      .andWhere(`(answer_check = ${answer_check})`)
      .getRawOne();
  }

  async getUserTotalCount(user_id) {
    return await this.qnaRepository
      .createQueryBuilder()
      .select('count(*) as count')
      .where(`user_id = '${user_id}' and category='qna'`)
      .getRawOne();
  }

  async updateQna(num, updateQnaDto) {
    const set = {};
    const id = updateQnaDto['user_id'];
    for (const element in updateQnaDto) {
      if (element === 'user_id') continue;
      if (element === 'key') continue;
      if (element === 'answer_check') {
        if (updateQnaDto['answer_check'])
          set['answer_date'] = () => `left(NOW(),19)`;
        else set['answer_date'] = '';
      }
      if (updateQnaDto[element] != null) set[element] = updateQnaDto[element];
    }
    // console.log(set);
    const result = await this.qnaRepository
      .createQueryBuilder()
      .update(Qna)
      .set(set)
      .where(`num = ${num} AND user_id = '${id}'`)
      .execute();

    if (!result['affected'])
      throw new HttpException('조건에 맞는 게시글이 없습니다.', 400);
    return result;
  }

  async deleteQna(num, user_id) {
    const result = await this.qnaRepository
      .createQueryBuilder()
      .delete()
      .where(`num = ${num} AND user_id = '${user_id}'`)
      .execute();
    if (!result['affected'])
      throw new HttpException('조건에 맞는 게시글이 없습니다.', 400);
    return true;
  }
}
