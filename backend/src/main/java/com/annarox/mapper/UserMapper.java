package com.annarox.mapper;

import org.mapstruct.Builder;
import org.mapstruct.Mapper;

import com.annarox.dtos.UserRegistrationDTO;
import com.annarox.dtos.UserResponseDTO;
import com.annarox.entity.User;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface UserMapper {
    // If field names are identical, MapStruct maps them automatically.
    // If you need to map 'password' from DTO to 'passwordHash' in Entity:
    // @Mapping(target = "passwordHash", source = "password")
    User toEntity(UserRegistrationDTO dto);

    UserResponseDTO toDTO(User user);

}
