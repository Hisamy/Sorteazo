import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    createSorteoDto: CreateSorteoDto, 
    idOrganizador: string,
    files?: { imagenSorteo?: Express.Multer.File[], imagenesPremios?: Express.Multer.File[] }
  ) {
    const organizador = await this.organizadorRepository.findOneBy({userId:idOrganizador});
    if(!organizador) throw new NotFoundException("There is not an Organizador at the database.")
    const boletos:Boleto[] = [];
    const premios:Premio[] = [];

    let maxNumber:number = createSorteoDto.startNumber + createSorteoDto.numbersQuantity;
    for(let i = createSorteoDto.startNumber; i < maxNumber; i++){
      const boleto:Boleto = this.boletoRepository.create({
        number:i.toString(), 
        price:createSorteoDto.ticketPrice
      })
      boletos.push(boleto);
    }

    const imagenSorteoUrl = files?.imagenSorteo?.[0] 
      ? `/uploads/${files.imagenSorteo[0].filename}` 
      : createSorteoDto.imageUrl || '';

    createSorteoDto.premios.forEach((p, index) => {
      const imagenPremioUrl = files?.imagenesPremios?.[index]
        ? `/uploads/${files.imagenesPremios[index].filename}`
        : p.imageUrl || '';

      const premio:Premio = this.premioRepository.create({
        name: p.name, 
        place: p.place, 
        imageUrl: imagenPremioUrl, 
        description: p.description
      })
      premios.push(premio)
    })

    const sorteo:Sorteo = this.sorteoRepository.create({
      title:createSorteoDto.title,
      ticketPrice:createSorteoDto.ticketPrice,
      numbersQuantity:createSorteoDto.numbersQuantity,
      startNumber:createSorteoDto.startNumber,
      imageUrl: imagenSorteoUrl,
      description:createSorteoDto.description,
      paymentDeadline:createSorteoDto.paymentDeadline,
      saleStartDate:createSorteoDto.saleStartDate,
      saleEndDate:createSorteoDto.saleEndDate,
      raffleDateTime:createSorteoDto.raffleDateTime,
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
