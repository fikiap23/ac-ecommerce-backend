import { Injectable } from '@nestjs/common';
import { CreateMessageDto, UpdateMessageDto } from '../dto/message.dto';
import { MessageRepository } from '../repositories/message.repository';
import { SearchPaginationDto } from 'utils/dto/pagination.dto';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async create(dto: CreateMessageDto) {
    const { ...cleanDto } = dto;
    return await this.messageRepository.create({
      data: {
        ...cleanDto,
      },
    });
  }

  async getAll(filter: SearchPaginationDto) {
    return await this.messageRepository.getManyPaginate({
      filter: {
        limit: filter.limit,
        page: filter.page,
        sort: filter.sort,
        search: filter.search,
      },
    });
  }

  async getByUuid(uuid: string) {
    return await this.messageRepository.getThrowByUuid({
      uuid,
    });
  }

  async updateByUuid(uuid: string, dto: UpdateMessageDto) {
    const message = await this.messageRepository.getThrowByUuid({
      uuid,
    });

    const { ...cleanDto } = dto;
    return await this.messageRepository.updateById({
      id: message.id,
      data: {
        ...cleanDto,
      },
    });
  }

  async deleteByUuid(uuid: string) {
    const message = await this.messageRepository.getThrowByUuid({
      uuid,
    });
    return await this.messageRepository.deleteById({ id: message.id });
  }
}
