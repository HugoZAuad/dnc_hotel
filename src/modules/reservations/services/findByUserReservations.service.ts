import { Inject, Injectable } from "@nestjs/common"
import { RESERVATION_REPOSITORIES_TOKEN } from "../utils/repositoriesReservation.Tokens"
import { ReservationRepositories } from "../infra/reservations.repositories"

@Injectable()
export class FindByUserReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORIES_TOKEN)
    private readonly eservationRepositories: ReservationRepositories,

  ) { }

  async execute(id: number){
    return await this.eservationRepositories.findByUser(id)
  }
}