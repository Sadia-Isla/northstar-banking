FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["banking-domain/backend/BankingApi/BankingApi.csproj", "banking-domain/backend/BankingApi/"]
RUN dotnet restore "banking-domain/backend/BankingApi/BankingApi.csproj"

COPY . .
WORKDIR "/src/banking-domain/backend/BankingApi"
RUN dotnet publish "BankingApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "NorthstarBankApi.dll"]
