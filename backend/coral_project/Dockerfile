# Use a JDK for building
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Copy source code
COPY . .

# Build the project (this creates a jar in build/libs)
RUN gradle build -x test

# Use a lightweight JDK runtime
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the port (adjust if not 3000)
EXPOSE 3000

# Run the server
CMD ["java", "-jar", "app.jar"]
