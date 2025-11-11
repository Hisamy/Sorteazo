import { Injectable } from '@nestjs/common';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { UpdateSorteoDto } from './dto/update-sorteo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sorteo } from './entities/sorteo.entity'; 
import { Boleto } from '../boletos/entities/boleto.entity'; 
import { Organizador } from '../users/entities/organizador.entity';
import { Premio } from './entities/premio.entity';

@Injectable()
export class SorteosService {
  constructor(
    @InjectRepository(Sorteo) private readonly sorteoRepository,
    @InjectRepository(Boleto) private readonly boletoRepository,
    @InjectRepository(Premio) private readonly premioRepository,
    @InjectRepository(Organizador) private readonly organizadorRepository
  ){}

  async create(createSorteoDto: CreateSorteoDto, idOrganizador:string) {
    const organizador = await this.organizadorRepository.findOneBy({userId:idOrganizador});
    const boletos:Boleto[] = [];
    const premios:Premio[] = [];

    let maxNumber:number = createSorteoDto.startNumber + createSorteoDto.numbersQuantity;
    for(let i = createSorteoDto.startNumber; i < maxNumber; i++){
      const boleto:Boleto = this.boletoRepository.create({
        number:i, 
        price:createSorteoDto.ticketPrice
      })
      boletos.push(boleto);
    }

    createSorteoDto.premios.forEach((p)=>{
      const premio:Premio = this.premioRepository.create({
        name:p.name, 
        place:p.place, 
        imageUrl:p.imageUrl, 
        description:p.description
      })
      premios.push(premio)
    })

    const sorteo:Sorteo = this.sorteoRepository.create({
      title:createSorteoDto.title,
      ticketPrice:createSorteoDto.ticketPrice,
      numbersQuantity:createSorteoDto.numbersQuantity,
      startNumber:createSorteoDto.startNumber,
      imageUrl:createSorteoDto.imageUrl,
      description:createSorteoDto.description,
      paymentDeadLine:createSorteoDto.paymentDeadline,
      saleStartDate:createSorteoDto.saleStartDate,
      raffleDataTime:createSorteoDto.raffleDateTime,
      organizador:organizador,
      premios:premios,
      boletos:boletos
    });

    const savedSorteo = await this.sorteoRepository.save(sorteo);

    return savedSorteo;
  }

  findAll() {
    return `This action returns all sorteos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sorteo`;
  }

  update(id: number, updateSorteoDto: UpdateSorteoDto) {
    return `This action updates a #${id} sorteo`;
  }

  remove(id: number) {
    return `This action removes a #${id} sorteo`;
  }
}
