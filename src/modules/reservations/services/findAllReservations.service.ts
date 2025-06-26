import { Inject, Injectable } from "@nestjs/common"
import { RESERVATION_REPOSITORIES_TOKEN } from "../utils/repositoriesReservation.Tokens"
import { ReservationRepositories } from "../infra/reservations.repositories"

@Injectable()
export class FindAllReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORIES_TOKEN)
    private readonly ReservationsRepositories: ReservationRepositories,

  ) { }

  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit
    const data = await this.ReservationsRepositories.findAll(offSet, limit)
    const total = await this.ReservationsRepositories.countReservations()

    return {
      total,
      page,
      per_page: limit,
      data
    }
  }
}