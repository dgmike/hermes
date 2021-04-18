import { Get, HttpCode, JsonController } from "routing-controllers";

@JsonController("/api")
class RootController {
  @Get("/")
  @HttpCode(204)
  get(): string {
    return "";
  }
}

export { RootController };
