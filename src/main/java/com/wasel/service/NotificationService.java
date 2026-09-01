package com.wasel.service;

import com.wasel.dto.notification.NotificationDto;
import com.wasel.entity.Notification;
import com.wasel.entity.User;
import com.wasel.enums.NotificationType;
import com.wasel.exception.ForbiddenException;
import com.wasel.exception.ResourceNotFoundException;
import com.wasel.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public void sendNotification(User user, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDto> getMyNotifications(String email) {
        User user = userService.getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String email) {
        User user = userService.getUserByEmail(email);
        return notificationRepository.countByUserIdAndIsRead(user.getId(), false);
    }

    @Transactional
    public NotificationDto markAsRead(String email, Long notificationId) {
        User user = userService.getUserByEmail(email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only manage your own notifications");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return mapToDto(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userService.getUserByEmail(email);
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(user.getId(), false);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
