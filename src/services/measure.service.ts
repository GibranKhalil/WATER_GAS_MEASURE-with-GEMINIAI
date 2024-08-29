import { MeasureType } from '../@types/measure.types';
import { AppDataSource } from '../dataSource';
import { CreateMeasureDTO } from '../dto/createMeasure.dto';
import { UpdateMeasureDTO } from '../dto/updateMeasure.dto';
import { MeasureEntity } from '../entities/measure.entity';
import { Repository } from 'typeorm';

export class MeasureService {
  constructor(
    private readonly measureRepository: Repository<MeasureEntity> = AppDataSource.getRepository(
      MeasureEntity,
    ),
  ) {}

  async getAllCustomerMeasures(customer_code: string) {
    try {
      const response = await this.measureRepository.find({
        where: { customer_code },
      });
      return response;
    } catch (error) {
      throw new Error(`Erro ao obter as leituras do cliente: ${error}`);
    }
  }

  async getAllCustomerMeasuresByType(
    customer_code: string,
    measure_type: MeasureType,
  ) {
    try {
      const response = await this.measureRepository.find({
        where: { customer_code, measure_type },
      });
      return response;
    } catch (error) {
      throw new Error(
        `Erro ao obter as leituras do cliente por tipo: ${error}`,
      );
    }
  }

  async createMeasure(measureData: CreateMeasureDTO) {
    try {
      return await this.measureRepository.save(measureData);
    } catch (error) {
      throw new Error(`Erro ao criar uma nova leitura: ${error}`);
    }
  }

  async updateMeasure(measureData: UpdateMeasureDTO, measure_uuid: string) {
    try {
      return this.measureRepository.update(measure_uuid, measureData);
    } catch (error) {
      throw new Error(`Erro ao atualizar a leitura: ${error}`);
    }
  }

  async checkMeasureTypeInMonth(
    measureType: MeasureType,
    customer_code: string,
    targetDate: Date,
  ): Promise<boolean> {
    try {
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();

      const measure = await this.measureRepository
        .createQueryBuilder('measure')
        .where('measure.measure_type = :measureType', { measureType })
        .andWhere('measure.customer_code = :customer_code', { customer_code })
        .andWhere('EXTRACT(MONTH FROM measure.measure_datetime) = :month', {
          month,
        })
        .andWhere('EXTRACT(YEAR FROM measure.measure_datetime) = :year', {
          year,
        })
        .getOne();

      return !!measure;
    } catch (error) {
      throw error;
    }
  }

  async checkMeasureExistsByID(measure_uuid: string): Promise<boolean> {
    try {
      const checkCode = await this.measureRepository.findOne({
        where: { id: measure_uuid },
      });
      return !!checkCode;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }

  async checkMeasureHadConfirmed(measure_uuid: string): Promise<boolean> {
    try {
      const checkConfirmed = await this.measureRepository.findOne({
        where: { id: measure_uuid, has_confirmed: true },
      });
      return !!checkConfirmed;
    } catch (error) {
      throw new Error(
        `Erro ao verificar se a leitura já foi confirmada: ${error}`,
      );
    }
  }
}
