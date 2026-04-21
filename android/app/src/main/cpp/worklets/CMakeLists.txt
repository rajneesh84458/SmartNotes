# Use hermesvm for newer RN versions, otherwise fallback to libhermes
if(ReactAndroid_VERSION_MINOR GREATER_EQUAL 82)
    target_link_libraries(worklets hermes-engine::hermesvm)
else()
    target_link_libraries(worklets hermes-engine::libhermes)
endif()
