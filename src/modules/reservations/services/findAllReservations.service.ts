import { Inject, Injectable } from "@nestjs/common"
import { RESERVATION_REPOSITORIES_TOKEN } from "../utils/repositoriesReservation.Tokens"
import { ReservationRepositories } from "../infra/reservations.repositories"

@Injectable()
export class FindAllReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORIES_TOKEN)
    private readonly ReservationsRepositories: ReservationRepositories,

  ) { }

  async execute(){
    return await this.ReservationsRepositories.findAll()
  }
}