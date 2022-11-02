import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { response } from 'express';
import { UserMapper } from 'src/user/user.mapper';
import { CreateQnaWebDto } from './dto/create-qna-web.dto';
import { CreateQnaDto } from './dto/create-qna.dto';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { QnaMapper } from './qna.mapper';

@Injectable()
export class QnaService {
  constructor(
    private readonly qnaMapper: QnaMapper,
    private userMapper: UserMapper,
  ) {}
  async createQna(createQnaDto: CreateQnaDto) {
    return await this.qnaMapper.createQna(createQnaDto);
  }
  async createQnaWeb(createQnaWebDto: CreateQnaWebDto) {
    return await this.qnaMapper.createQnaWeb(createQnaWebDto);
  }

  async findQna(ct: string, answer_check, page: number) {
    if (ct === 'all') ct = `'qna' OR category = 'edit'`;
    else ct = `'${ct}'`;
    if (answer_check === 'all') answer_check = 'true OR answer_check = false';

    const viewCount = 20;
    const startCount = (page - 1) * viewCount;
    const result = {
      total_count: 0,
      isEnd: false,
      qna: null,
    };
    const totalCount = await this.qnaMapper.getTotalCount(ct, answer_check);
    console.log(totalCount);
    result['total_count'] = totalCount['count'];
    if (totalCount['count'] - viewCount * page <= 0) result['isEnd'] = true;
    result['qna'] = await this.qnaMapper.findQna(
      ct,
      answer_check,
      viewCount,
      startCount,
    );

    return result;
  }

  async findById(user_id: string, page: number) {
    const viewCount = 20;
    const startCount = (page - 1) * viewCount;
    const result = {
      total_count: 0,
      isEnd: false,
      qna: null,
    };
    const totalCount = await this.qnaMapper.getUserTotalCount(user_id);
    console.log(totalCount);
    result['total_count'] = totalCount['count'];
    if (totalCount['count'] - viewCount * page <= 0) result['isEnd'] = true;
    result['qna'] = await this.qnaMapper.findById(
      user_id,
      viewCount,
      startCount,
    );

    return result;
  }

  async updateQna(num: number, updateQnaDto: UpdateQnaDto) {
    const { user_id } = updateQnaDto;
    const answer = await this.qnaMapper.updateQna(num, updateQnaDto);
    const user = await this.userMapper.getUser(user_id);
    const qna = await this.qnaMapper.findByNum(num);
    if (answer['affected']) {
      axios({
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'post',
        data: {
          notification: {
            title: '탭플레이스',
            body: `문의하신 [${qna['title']}]에 대한 답변이 등록되었습니다.`,
            sound: 'default',
            badge: 0,
          },
          data: {
            type: 'qna',
          },
          content_available: true,
          mutable_content: true,
          priority: 'high',
          to: user['token'],
        },
        headers: { Authorization: process.env.FCM_KEY },
      })
        .then((response) => {
          // console.log(response, 'dddddddddd');
        })
        .catch((err) => console.log(err));
    }
    // console.log(user['token']);
    // console.log(process.env.FCM_KEY);
    return true;
  }

  async deleteQna(num: number, user_id) {
    return this.qnaMapper.deleteQna(num, user_id);
  }
}
