FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy PocketBase binary
COPY pocketbase .
RUN chmod +x pocketbase

# Copy data directories (if they exist)
COPY pb_data ./pb_data/
COPY pb_migrations ./pb_migrations/
COPY pb_hooks ./pb_hooks/

# Expose port
EXPOSE 8080

# Run PocketBase
CMD ["./pocketbase/pocketbase", "serve", "--http=0.0.0.0:8080"]
