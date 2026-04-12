SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `ds`.`idDiaSemana` AS `idDiaSemana`,
  `ds`.`diaSemana` AS `diaSemana`
FROM
  (
    (
      `teste_grade_horario`.`professor` `p`
      JOIN `teste_grade_horario`.`professor_disponibilidade` `pd` ON((`p`.`idProfessor` = `pd`.`idProfessor`))
    )
    JOIN `teste_grade_horario`.`dia_semana` `ds` ON((`pd`.`idDiaSemana` = `ds`.`idDiaSemana`))
  )