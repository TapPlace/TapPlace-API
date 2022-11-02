import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { QnaService } from './qna.service';
import { CreateQnaDto } from './dto/create-qna.dto';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { adminPipe, userPipe } from 'src/auth/auth.pipe';
import { CreateQnaWebDto } from './dto/create-qna-web.dto';

@Controller('qna')
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() createQnaDto: CreateQnaDto, @GetUser(userPipe) user) {
    await this.qnaService.createQna(createQnaDto);
    throw new HttpException('ok', 200);
  }

  @Post('/web')
  async createQnaWen(@Body() createQnaWebDto: CreateQnaWebDto) {
    await this.qnaService.createQnaWeb(createQnaWebDto);
    throw new HttpException('ok', 200);
  }

  @Get(':user_id/:page')
  @UseGuards(AuthGuard())
  findQna(
    @Param('user_id') user_id: string,
    @Param('page') page: number,
    @GetUser(userPipe) user,
  ) {
    return this.qnaService.findById(user_id, page);
  }

  @Get(':category/:answer_check/:page')
  @UseGuards(AuthGuard())
  find(
    @Param('category') ct: string,
    @Param('answer_check') answer_check: string,
    @Param('page') page: number,
    @GetUser(adminPipe) admin,
  ) {
    return this.qnaService.findQna(ct, answer_check, page);
  }

  @Patch(':num')
  @UseGuards(AuthGuard())
  async update(
    @Param('num') num: number,
    @Body() updateQnaDto: UpdateQnaDto,
    @GetUser(adminPipe) admin,
  ) {
    await this.qnaService.updateQna(num, updateQnaDto);

    throw new HttpException('ok', 200);
  }

  // @Delete(':num')
  // async delete(@Param('num') num: number, @Body('user_id') user_id: string) {
  //   await this.qnaService.deleteQna(num, user_id);

  //   throw new HttpException('ok', 200);
  // }
}
