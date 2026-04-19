This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# EC2 Backend setup
## Connect to EC2
```
ssh -i your-key.pem ubuntu@your-ec2-ip
```
## Install java 
```
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

## Install PostgreSQL
```
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## Create DB + User
```
sudo -u postgres psql
```
### Inside psql:
```
CREATE DATABASE mydb;
CREATE USER myuser WITH PASSWORD 'StrongPass@123';

ALTER ROLE myuser SET client_encoding TO 'utf8';
ALTER ROLE myuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE myuser SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
```
## Restart
```
sudo systemctl restart postgresql
```

##


## Build Springboot jar on local machine
```
mvn clean package -DskipTests
```

## Run jar locally
```
java -jar target\app.jar
```
## Upload your Spring Boot JAR

From your local machine:
```
scp -i your-key.pem target/app.jar ubuntu@your-ec2-ip:/home/ubuntu/
```
```
cp -i "C:\Users\dnyan\Downloads\arx-kp.pem" target\park24-backend-0.0.1-SNAPSHOT.jar ubuntu@3.110.172.5:/home/ubuntu/
```

## Configure Spring Boot

In your app (application.properties):
```
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=myuser
spring.datasource.password=StrongPass@123

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```
```
spring:
  application:
    name: park24-backend

  datasource:
    url: jdbc:postgresql://localhost:5432/annarox
    username: myuser
    password: StrongPass@123
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: 8080
```

## Create systemd service (auto run)
```
sudo nano /etc/systemd/system/myapp.service
```
- paste
```
[Unit]
Description=Spring Boot App
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/java -jar /home/ubuntu/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Enable & start service
```
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp
```
### Check status
```
sudo systemctl status myapp
```

### Logs
```
journalctl -u myapp -f
```
### stop app
```
sudo systemctl stop myapp
```

### Reload
```
sudo systemctl daemon-reload
```

### connect to postgres
```
psql -U dnyanesh -d annarox -h localhost -W
```