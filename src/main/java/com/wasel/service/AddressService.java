package com.wasel.service;

import com.wasel.dto.address.AddressDto;
import com.wasel.dto.address.CreateAddressRequest;
import com.wasel.entity.Address;
import com.wasel.entity.Customer;
import com.wasel.entity.User;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final CustomerService customerService;
    private final UserService userService;

    public List<AddressDto> getMyAddresses(String email) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());

        return addressRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto createAddress(String email, CreateAddressRequest request) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());

        Address address = Address.builder()
                .customer(customer)
                .label(request.getLabel())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .buildingNumber(request.getBuildingNumber())
                .floor(request.getFloor())
                .apartment(request.getApartment())
                .notes(request.getNotes())
                .build();

        address = addressRepository.save(address);
        return mapToDto(address);
    }

    @Transactional
    public AddressDto updateAddress(String email, Long addressId, CreateAddressRequest request) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());
        Address address = getAddressById(addressId);

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only update your own addresses");
        }

        address.setLabel(request.getLabel());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setBuildingNumber(request.getBuildingNumber());
        address.setFloor(request.getFloor());
        address.setApartment(request.getApartment());
        address.setNotes(request.getNotes());

        address = addressRepository.save(address);
        return mapToDto(address);
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = userService.getUserByEmail(email);
        Customer customer = customerService.getCustomerByUserId(user.getId());
        Address address = getAddressById(addressId);

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only delete your own addresses");
        }

        addressRepository.delete(address);
    }

    public Address getAddressById(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }

    public AddressDto mapToDto(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .label(address.getLabel())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .buildingNumber(address.getBuildingNumber())
                .floor(address.getFloor())
                .apartment(address.getApartment())
                .notes(address.getNotes())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
