package com.wasel.service;

import com.wasel.dto.customer.CustomerDto;
import com.wasel.entity.Customer;
import com.wasel.entity.User;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserService userService;

    public Customer getCustomerByUserId(Long userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
    }

    public CustomerDto getCustomerProfile(String email) {
        User user = userService.getUserByEmail(email);
        Customer customer = getCustomerByUserId(user.getId());
        return mapToDto(customer);
    }

    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CustomerDto mapToDto(Customer customer) {
        return CustomerDto.builder()
                .id(customer.getId())
                .user(userService.mapToDto(customer.getUser()))
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
