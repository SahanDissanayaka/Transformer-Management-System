package com.TransformerUI.TransformerUI.service.util;

import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.FilterValue;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class DataSpecificationUtil {

    public static <T> Specification<T> buildSpecification(FilterRequest filterRequest) {
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filterRequest.getFilterValues() != null) {
                for (FilterValue filter : filterRequest.getFilterValues()) {
                    String column = filter.getColumnName();
                    Object[] values = filter.getValue();
                    String operation = filter.getOperation();

                    if (values != null && values.length > 0) {
                        String val = values[0].toString();

                        switch (operation) {
                            case "Include":
                                predicates.add(cb.like(cb.lower(root.get(column)), "%" + val.toLowerCase() + "%"));
                                break;
                            case "Equal":
                                predicates.add(cb.equal(root.get(column), val));
                                break;
                            // add more operations here if needed
                        }
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
